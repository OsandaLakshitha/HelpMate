// ═══════════════════════════════════════════════════════════════════════════
// taskController.js — v4.3 (DYNAMIC PREDICTION UPDATE)
//
// Changes from v4.2:
//
//   createTask:
//     ADDED: recalculate() after task creation.
//     WHY: A new pending task changes pendingTaskCount → daily target,
//          trajectory score, capacity warning, and feasibility gate all
//          become stale if we don't recalculate immediately.
//
//   updateTask:
//     ADDED: recalculate() when prediction-critical fields change.
//     Critical fields: complexity, dueDate, assigneeId, status, estimatedHours
//     WHY: Changing complexity affects feasibility gate.
//          Changing dueDate affects days left and capacity.
//          Reassigning a task affects BOTH old and new assignee's predictions.
//
//   updateStatus:
//     CHANGED: BLOCKS "Completed" status through this endpoint.
//     WHY: This endpoint sets status to "Completed" without creating a
//          BCompletion record, without running anomaly detection, without
//          updating PSS, and without triggering recalculate(). It's a
//          backdoor that bypasses the entire prediction pipeline.
//          Students MUST use PUT /:id/complete instead.
//     ADDED: recalculate() for non-Completed status changes.
//
//   completeTask, generateTasks — UNCHANGED from v4.2
//   addProofFile, addProofCommit, getRepoCommits — UNCHANGED
// ═══════════════════════════════════════════════════════════════════════════

import axios               from 'axios';
import BTask               from '../../models/Bmodels/BTask.js';
import BProject            from '../../models/Bmodels/BProject.js';
import BCompletion         from '../../models/Bmodels/Bcompletion.js';
import { recalculate, recalculateAllForStudent } from '../../services/Bservices/Predictionengine.js';
import { detectAnomalies } from '../../services/Bservices/Anomalydetector.js';
import { generateTasks as claudeGenerateTasks } from '../../services/Bservices/Claudeservice.js';
import BProjectMember  from '../../models/Bmodels/BProjectMember.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import User            from '../../models/User.js';

const r2 = v => Math.round(v * 100) / 100;


// ─────────────────────────────────────────────────────────────────────────────
// createTask — v4.3 (CHANGED)
//
// ADDED: recalculate() after task is saved.
// A new task changes pendingTaskCount, which affects:
//   - dailyTarget (more tasks to distribute)
//   - trajectoryScore (denominator changed)
//   - requiredRate → capacityWarning
//   - complexityFeasibility gate (tasksPerRemDay changed)
//   - burstRateNeeded / burstFeasibilityPct
//
// Without this, the prediction stays frozen until the next completeTask
// or midnight cron — student could add 10 tasks and see no change.
// ─────────────────────────────────────────────────────────────────────────────
export async function createTask(req, res) {
  try {
    const { projectId, name, description, assigneeId, dueDate, taskType, complexity, status } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ message: 'Project ID and name are required' });
    }

    const project = await BProject.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await BTask.create({
      projectId,
      name,
      description,
      assigneeId,
      assignedById: req.user.id,
      status:       status || 'New',
      taskType,
      complexity,
      dueDate:      dueDate ? new Date(dueDate) : undefined,
    });

    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();

    // ── NEW: Recalculate prediction for the assignee ──────────────────────────
    // Non-fatal: task is already saved, prediction update is best-effort
    if (assigneeId) {
      try {
        await recalculate({
          studentId:   assigneeId,
          projectId,
          triggerType: 'task-created',
        });
      } catch (recalcErr) {
        console.warn('Recalculate after createTask failed (non-fatal):', recalcErr.message);
      }
    }

    res.status(201).json({ task: populatedTask });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// listTasks — UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
export async function listTasks(req, res) {
  try {
    const { projectId } = req.query;
    const filter = projectId
      ? { projectId }
      : { assigneeId: req.user.id };

    const tasks = await BTask.find(filter)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .sort({ order: 1, updatedAt: -1 })
      .lean();

    res.json({ tasks });
  } catch (err) {
    console.error('listTasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// getTask — UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
export async function getTask(req, res) {
  try {
    const { id } = req.params;
    const task = await BTask.findById(id)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    console.error('getTask error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// updateTask — v4.3 (CHANGED)
//
// ADDED: Detects when prediction-critical fields change, then triggers
// recalculate() for the current assignee (and old assignee if reassigned).
//
// Critical fields and their impact:
//   complexity      → feasibilityGate, capacityWarning, burstFeasibilityPct
//   dueDate         → per-task deadline metrics, completionState on overdue check
//   assigneeId      → both old + new assignee's pendingTaskCount changes
//   status          → pendingTasks count changes
//   estimatedHours  → rebalance's estimatedDays calculation
//
// Non-critical fields (name, description, steps, youtubeQueries, order)
// don't affect predictions and skip recalculation for performance.
// ─────────────────────────────────────────────────────────────────────────────
export async function updateTask(req, res) {
  try {
    const { id }  = req.params;
    const updates = req.body;

    // Capture the task BEFORE update to detect meaningful changes
    const taskBefore = await BTask.findById(id).lean();
    if (!taskBefore) return res.status(404).json({ message: 'Task not found' });

    const updatedTask = await BTask.findByIdAndUpdate(id, updates, { new: true })
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    // ── NEW: Check if prediction-critical fields changed ──────────────────────
    const criticalFieldChanged =
      updates.complexity      !== undefined ||
      updates.dueDate         !== undefined ||
      updates.assigneeId      !== undefined ||
      updates.status          !== undefined ||
      updates.estimatedHours  !== undefined;

    if (criticalFieldChanged) {
      // Recalculate for the CURRENT assignee
      const currentAssigneeId = updatedTask.assigneeId?._id || updatedTask.assigneeId;
      try {
        await recalculate({
          studentId:   currentAssigneeId,
          projectId:   updatedTask.projectId,
          triggerType: 'task-updated',
        });
      } catch (recalcErr) {
        console.warn('Recalculate after updateTask failed (non-fatal):', recalcErr.message);
      }

      // If assignee CHANGED, also recalculate for the OLD assignee
      // Old assignee has one fewer pending task → their predictions improve
      if (updates.assigneeId && String(taskBefore.assigneeId) !== String(updates.assigneeId)) {
        try {
          await recalculate({
            studentId:   taskBefore.assigneeId,
            projectId:   taskBefore.projectId,
            triggerType: 'task-reassigned',
          });
        } catch (recalcErr) {
          console.warn('Recalculate for old assignee failed (non-fatal):', recalcErr.message);
        }
      }
    }

    res.json({ task: updatedTask });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// updateStatus — v4.3 (CHANGED)
//
// CRITICAL FIX: Blocks "Completed" status through this endpoint.
//
// In v4.2, calling PATCH /:id/status with { status: "Completed" } would:
//   ✗ Set task.status = "Completed"
//   ✗ NOT create a BCompletion record
//   ✗ NOT run anomaly detection
//   ✗ NOT update PSS (Personal Speed Score)
//   ✗ NOT trigger recalculate()
//   → The task disappears from pending count but the prediction pipeline
//     never knows about it. This creates a silent data gap.
//
// Fix: "Completed" MUST go through PUT /:id/complete which runs the full
// pipeline (anomaly detection → BCompletion → PSS → recalculate).
//
// Other status changes (In Progress, To Be Reviewed) now trigger
// recalculate() because they can affect daily metrics display.
// ─────────────────────────────────────────────────────────────────────────────
export async function updateStatus(req, res) {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    // ── BLOCK "Completed" — must use PUT /:id/complete ────────────────────────
    if (status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot set status to Completed through this endpoint. Use PUT /api/tasks/:id/complete instead.',
      });
    }

    const updates = { status };

    const task = await BTask.findByIdAndUpdate(id, updates, { new: true })
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // ── NEW: Recalculate after status change ──────────────────────────────────
    const assigneeId = task.assigneeId?._id || task.assigneeId;
    if (assigneeId) {
      try {
        await recalculate({
          studentId:   assigneeId,
          projectId:   task.projectId,
          triggerType: 'status-updated',
        });
      } catch (recalcErr) {
        console.warn('Recalculate after updateStatus failed (non-fatal):', recalcErr.message);
      }
    }

    res.json({ task });
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// generateTasks — UNCHANGED from v4.2
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTasks(req, res) {
  try {
    const { projectId, individualPart, additionalRules } = req.body;
    const studentId = req.user._id || req.user.id;

    if (!projectId)
      return res.status(400).json({ success: false, message: 'projectId is required' });

    const project = await BProject.findById(projectId);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });

    const member = await BProjectMember.findOne({ projectId, userId: studentId });
    if (!member)
      return res.status(404).json({ success: false, message: 'You are not a member of this project' });

    const part = individualPart?.trim() || member.individualPart;
    if (!part)
      return res.status(400).json({ success: false, message: 'Please describe your individual component' });

    if (individualPart?.trim()) {
      member.individualPart = individualPart.trim();
      await member.save();
    }

    const user = await User.findById(studentId);

    let availableTime = member.availableTime;
    if (!availableTime?.weekdays) {
      const profile = await BStudentProfile.findOne({ userId: studentId });
      availableTime = profile?.availableTime || { weekdays: 2, weekends: 4 };
    }

    const generated = await claudeGenerateTasks({
      pdfText:        project.pdfText    || '',
      groupApproach:  project.approach   || '',  // what the group is building — gives AI full context
      individualPart: part,
      member: {
        firstName:     user.firstName,
        lastName:      user.lastName,
        availableTime,
      },
      project: {
        title:      project.title,
        dueDate:    project.dueDate,
        complexity: project.complexity,
      },
    });

    if (!generated?.length)
      return res.status(500).json({ success: false, message: 'AI did not return any tasks' });

    await BTask.deleteMany({ projectId, assigneeId: studentId });

    const savedTasks = await Promise.all(
      generated.map(t =>
        BTask.create({
          projectId,
          name: t.title,
          description: t.description,
          steps: t.steps || [],
          youtubeQueries: t.youtubeQueries || [],
          order: t.order,
          assigneeId: studentId,
          assignedById: studentId,
          status: 'New',
          isAIGenerated: true,
        })
      )
    );

    await recalculate({
      studentId,
      projectId,
      triggerType: 'initial',
    });

    return res.status(201).json({
      success: true,
      message: `${savedTasks.length} tasks generated`,
      tasks: savedTasks,
    });

  } catch (err) {
    console.error('generateTasks error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// completeTask — UNCHANGED from v4.2
// PUT /api/tasks/:id/complete
// ─────────────────────────────────────────────────────────────────────────────
export async function completeTask(req, res) {
  try {
    const taskId    = req.params.id;
    const studentId = req.user._id || req.user.id;

    // ── 1. Validate ───────────────────────────────────────────────────────────
    const task = await BTask.findById(taskId);
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' });
    if (String(task.assigneeId) !== String(studentId))
      return res.status(403).json({ success: false, message: 'This is not your task' });
    if (task.status === 'Completed')
      return res.status(400).json({ success: false, message: 'Task already completed' });

    const now = new Date();

    // ── 2. Cold start check ───────────────────────────────────────────────────
    const validCompletionsSoFar = await BCompletion.countDocuments({
      studentId,
      countForColdStart: true,
    });
    const inColdStart = validCompletionsSoFar < 4;

    // ── 3. Anomaly detection — SKIPPED during cold start ─────────────────────
    let anomaly;
    let isBulk;
    let countForPSS;
    let countForColdStart;

    if (inColdStart) {
      anomaly = {
        anomalyDetected: false,
        worstSeverity:   null,
        patterns:        [],
        countForRatio:   true,
        countForColdStart: true,
      };
      isBulk            = false;
      countForPSS       = true;
      countForColdStart = true;

    } else {
      anomaly = await detectAnomalies({
        studentId,
        projectId: task.projectId,
        task,
        now,
      });

      const taskAgeDays = (now - new Date(task.createdAt)) / 86400000;
      const isPastTask  = taskAgeDays > 2;

      isBulk            = anomaly.patterns.some(p =>
        p.type === 'BURST' || p.type === 'VELOCITY_SPIKE'
      );
      countForPSS       = anomaly.countForRatio;
      countForColdStart = anomaly.countForColdStart || isPastTask;
    }

    const taskAgeDays = (now - new Date(task.createdAt)) / 86400000;
    const isPastTask  = taskAgeDays > 2;

    // ── 4. Mark task Completed + update BTask fields ─────────────────────────
    const actualDays         = r2(Math.max(0.5, (now - new Date(task.createdAt)) / 86400000));
    const estimatedHrs       = task.estimatedHours || (task.complexity || 3) * 1.5;
    const estimatedDays      = r2(Math.max(0.5, estimatedHrs / 2));
    const speedRatio         = r2(estimatedDays / actualDays);
    const cx                 = task.complexity || 3;
    const complexityWeight   = Math.pow(cx, 2);
    const weightedSpeedValue = r2(speedRatio * complexityWeight);

    // Calculate completedOnTime and daysEarlyOrLate using task.dueDate
    let completedOnTime = true;
    let daysEarlyOrLate = 0;
    let completionState = 'normal';
    if (task.dueDate) {
      const due        = new Date(task.dueDate);
      const diffHours  = (now - due) / 3600000;   // positive = late
      daysEarlyOrLate  = r2(-diffHours / 24);      // positive = early, negative = late
      completedOnTime  = now <= due;
      if (now <= due)        completionState = 'good';
      else if (diffHours <= 12) completionState = 'normal';
      else                   completionState = 'late';
    }

    task.status          = 'Completed';
    task.completedAt     = now;
    task.actualDays      = actualDays;
    task.speedRatio      = speedRatio;
    task.completionState = completionState;
    await task.save();

    // ── 5. Save BCompletion ───────────────────────────────────────────────────
    await BCompletion.create({
      taskId:    task._id,
      studentId,
      projectId: task.projectId,

      estimatedDays,
      actualDays,
      estimatedHours:     estimatedHrs,
      complexity:         cx,
      speedRatio,
      complexityWeight,
      weightedSpeedValue,
      completedOnTime,
      daysEarlyOrLate,
      completionState,
      pssAfterThis:       null,

      isBulk,
      isPastTask,
      countForPSS,
      countForColdStart,

      anomalyDetected: anomaly.anomalyDetected,
      anomalyPatterns: anomaly.patterns.map(p => p.type),
      anomalySeverity: anomaly.worstSeverity,
    });

    // ── 6. Recalculate prediction ─────────────────────────────────────────────
    const prediction = await recalculate({
      studentId,
      projectId:         task.projectId,
      triggerType:       'task-completed',
      triggeredByTaskId: task._id,
    });

    // ── 6b. CROSS-PROJECT CASCADE (NEW v7) ────────────────────────────────────
    //  If this completion caused the project to reach "complete" status,
    //  the student now has one fewer active project. This changes loadFactor
    //  for ALL other active projects — their dailyTargets should decrease
    //  and their trajectoryScores should improve.
    //
    //  Also cascades on ANY completion because urgency-weighted loadFactor
    //  means even non-completing tasks can shift relative urgency slightly.
    //  However, full cascade only triggers when project status changes
    //  to avoid unnecessary DB writes on every single task completion.
    if (prediction && prediction.status === 'complete') {
      try {
        await recalculateAllForStudent(studentId);
      } catch (cascadeErr) {
        console.warn('Cross-project cascade after completion failed (non-fatal):', cascadeErr.message);
      }
    }

    // ── 7. Response ───────────────────────────────────────────────────────────
    const completionsNow = validCompletionsSoFar + 1;
    const stillInColdStart = completionsNow < 4;
    const remaining        = Math.max(0, 4 - completionsNow);

    let message;
    if (inColdStart) {
      message = stillInColdStart
        ? `Task completed (${completionsNow}/4 — ${remaining} more to activate predictions)`
        : 'Task completed — predictions are now active!';
    } else {
      message = anomaly.anomalyDetected
        ? `Task completed — ${anomaly.patterns.length} unusual pattern(s) detected`
        : 'Task completed';
    }

    return res.status(200).json({
      success: true,
      message,
      task,
      prediction,

      coldStart: {
        wasActive:         inColdStart,
        completionsNow,
        completionsNeeded: 4,
        remaining,
        justUnlocked:      inColdStart && !stillInColdStart,
      },

      anomaly: {
        skipped:              inColdStart,
        detected:             anomaly.anomalyDetected,
        worstSeverity:        anomaly.worstSeverity,
        patterns:             anomaly.patterns,
        countedForPrediction: countForPSS,
        countedForUnlock:     countForColdStart,
      },

      isBulk,
      isPastTask,
      countForPSS,
    });

  } catch (err) {
    console.error('completeTask error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to complete task',
    });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// addProofFile — UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
export async function addProofFile(req, res) {
  try {
    const { id }    = req.params;
    const fileUrl   = req.file?.path;
    if (!fileUrl) return res.status(400).json({ message: 'No file uploaded' });

    const task = await BTask.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.proofFiles.push({ url: fileUrl, addedBy: req.user.id, addedAt: new Date() });
    await task.save();

    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();

    res.status(201).json({ message: 'Proof file added', task: populatedTask });
  } catch (err) {
    console.error('addProofFile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// addProofCommit — UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
export async function addProofCommit(req, res) {
  try {
    const { id }  = req.params;
    const { sha } = req.body;

    const task = await BTask.findById(id).populate('projectId');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const repoUrl = task.projectId.githubRepoUrl;
    const match   = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ message: 'Invalid repo URL' });

    const [, owner, repo] = match;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
    );

    const commitData = response.data;
    task.proofCommits.push({
      sha:        commitData.sha,
      message:    commitData.commit.message,
      authorName: commitData.commit.author.name,
      authoredAt: new Date(commitData.commit.author.date),
    });
    await task.save();

    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();

    res.status(201).json({ message: 'Proof commit added', task: populatedTask });
  } catch (err) {
    console.error('addProofCommit error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to add proof commit' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// getRepoCommits — UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
export async function getRepoCommits(req, res) {
  try {
    const { projectId } = req.params;
    const project = await BProject.findById(projectId);

    if (!project || !project.githubRepoUrl) {
      return res.status(404).json({ message: 'Project or repo not found' });
    }

    const match = project.githubRepoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) return res.status(400).json({ message: 'Invalid repo URL' });

    const [, owner, repo] = match;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        params:  { per_page: 50 },
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept:        'application/vnd.github.v3+json',
        },
      }
    );

    const commits = response.data.map(c => ({
      sha:        c.sha,
      message:    c.commit.message,
      authorName: c.commit.author.name,
      authoredAt: c.commit.author.date,
      html_url:   c.html_url,
    }));

    res.json({ commits });
  } catch (err) {
    console.error('getRepoCommits error:', err.response?.status, err.response?.data?.message || err.message);
    res.status(err.response?.status || 500).json({
      message: err.response?.data?.message || 'Failed to fetch commit history',
    });
  }
}