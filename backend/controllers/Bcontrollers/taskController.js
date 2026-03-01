import axios from 'axios';
import BTask from '../../models/Bmodels/BTask.js';
import BProject from '../../models/Bmodels/BProject.js';
import BProjectMember from '../../models/Bmodels/BProjectMember.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import BCompletion from '../../models/Bmodels/Bcompletion.js';
import User from '../../models/User.js';
import { generateTasks as claudeGenerateTasks } from '../../services/Bservices/Claudeservice.js';
import { calcBCP } from '../../services/Bservices/Bcpengine.js';
import { recalculate } from '../../services/Bservices/Predictionengine.js';
import { checkWorkload } from '../../services/Bservices/Workloadchecker.js';
import { rebalanceProject, rebalanceAll as rebalanceAllProjects } from '../../services/Bservices/Rebalanceservice.js';

const r = (v) => Math.round(v * 100) / 100
// ── NEW: generateTasks ────────────────────────────────────────────────────────
// POST /api/tasks/generate
// Reads pdfText from project + individualPart from member → sends to Claude
// Each task saved as a separate BTask document
export async function generateTasks(req, res) {
  try {
    const { projectId, individualPart, additionalRules } = req.body;
    const studentId = req.user._id || req.user.id;

    if (!projectId) return res.status(400).json({ success: false, message: 'projectId is required' });

    const project = await BProject.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const member = await BProjectMember.findOne({ projectId, userId: studentId });
    if (!member) return res.status(404).json({ success: false, message: 'You are not a member of this project' });

    // Accept individualPart from body OR from saved member record
    const part = individualPart?.trim() || member.individualPart;
    if (!part) {
      return res.status(400).json({ success: false, message: 'Please describe your individual component' });
    }

    // Save individual part if sent from frontend
    if (individualPart?.trim()) {
      member.individualPart = individualPart.trim();
      await member.save();
    }

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Available time: member-specific → fall back to profile → fall back to defaults
    let availableTime = member.availableTime;
    if (!availableTime?.weekdays) {
      const profile = await BStudentProfile.findOne({ userId: studentId });
      availableTime = profile?.availableTime || { weekdays: 2, weekends: 4 };
    }

    // Workload check — WARN only, never block
    let workloadWarning = null;
    try {
      const workload = await checkWorkload({
        studentId,
        projectId,
        projectDueDate: project.dueDate,
        availableTime,
      });
      if (workload.isWarning) workloadWarning = workload.message;
    } catch (e) {
      console.warn('Workload check failed (non-fatal):', e.message);
    }

    // BCP — cold start safe (returns null if no history)
    let bcp = null;
    try {
      bcp = await calcBCP(studentId);
    } catch (e) {
      console.warn('BCP calc failed (non-fatal):', e.message);
    }

    // Generate tasks via Gemini
    const generated = await claudeGenerateTasks({
      pdfText:        project.pdfText || '',
      approach:       project.approach || project.description || '',
      individualPart: part,
      additionalRules: additionalRules?.trim() || '',
      member: {
        firstName:     user.firstName,
        lastName:      user.lastName,
        availableTime,
      },
      project: {
        title:   project.title,
        dueDate: project.dueDate,
      },
      bcp, // null on first use — Gemini uses defaults
    });

    if (!generated?.length) {
      return res.status(500).json({ success: false, message: 'AI did not return any tasks. Please try again.' });
    }

    // Delete old tasks for this student in this project before saving new ones
    await BTask.deleteMany({ projectId, assigneeId: studentId });

    // Save each task
    const now = new Date();
    const savedTasks = await Promise.all(
      generated.map(async (t) => {
        const taskDueDate   = t.dueDate ? new Date(t.dueDate) : new Date(project.dueDate);
        const estimatedDays = Math.max(1, Math.round((taskDueDate - now) / (1000 * 60 * 60 * 24)));
        return BTask.create({
          projectId,
          name:           t.title,
          description:    t.description,
          steps:          t.steps          || [],
          youtubeQueries: t.youtubeQueries || [],
          dueDate:        taskDueDate,
          complexity:     t.complexity     || 3,
          estimatedHours: t.estimatedHours || 2,
          estimatedDays,
          assigneeId:     studentId,
          assignedById:   studentId,
          status:         'New',
          isAIGenerated:  true,
        });
      })
    );

    // Mark tasks as generated on member record
    await BProjectMember.findOneAndUpdate(
      { projectId, userId: studentId },
      { tasksGenerated: true, tasksGeneratedAt: now }
    );

    // Initial prediction — cold start safe
    try {
      await recalculate({ studentId, projectId, triggerType: 'initial' });
    } catch (e) {
      console.warn('Initial prediction failed (non-fatal):', e.message);
    }

    return res.status(201).json({
      success:         true,
      message:         `${savedTasks.length} tasks generated`,
      tasks:           savedTasks,
      workloadWarning, // send to frontend to show if needed
    });

  } catch (err) {
    console.error('generateTasks error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate tasks' });
  }
}

// ── NEW: completeTask ─────────────────────────────────────────────────────────
// PUT /api/tasks/:id/complete
// Student marks task done → creates BCompletion → updates PSS → recalculates prediction
export async function completeTask(req, res) {
  try {
    const taskId    = req.params.id;
    const studentId = req.user._id || req.user.id;

    const task = await BTask.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (String(task.assigneeId) !== String(studentId)) {
      return res.status(403).json({ success: false, message: 'This is not your task' });
    }
    if (task.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Task already completed' });
    }

    const now           = new Date();
    const dueDate       = new Date(task.dueDate);
    const actualDays    = Math.max(0.5, (now - new Date(task.createdAt)) / (1000 * 60 * 60 * 24));
    const estimatedDays = task.estimatedDays || 1;
    const speedRatio    = estimatedDays / actualDays;

    // 12-hour grace period
    const graceLine = new Date(dueDate.getTime() + 12 * 60 * 60 * 1000);
    let completionState;
    if (now < dueDate)        completionState = 'good';
    else if (now <= graceLine) completionState = 'normal';
    else                      completionState = 'late';

    const completedOnTime = now <= dueDate;
    const daysEarlyOrLate = (dueDate - now) / (1000 * 60 * 60 * 24);

    // Update task
    task.status          = 'Completed';
    task.completedAt     = now;
    task.actualDays      = r(actualDays);
    task.speedRatio      = r(speedRatio);
    task.completionState = completionState;
    await task.save();

    // BCompletion
    const complexityWeight   = Math.pow(task.complexity || 3, 2);
    const weightedSpeedValue = speedRatio * complexityWeight;

    const existing   = await BCompletion.find({ studentId });
    const totalWV    = existing.reduce((s, c) => s + c.weightedSpeedValue, 0) + weightedSpeedValue;
    const totalW     = existing.reduce((s, c) => s + c.complexityWeight,   0) + complexityWeight;
    const newPSS     = Math.max(0.2, Math.min(3.0, totalW > 0 ? totalWV / totalW : 0.85));
    const dataPoints = existing.length + 1;

    await BCompletion.create({
      taskId:             task._id,
      studentId,
      projectId:          task.projectId,
      estimatedDays:      r(estimatedDays),
      actualDays:         r(actualDays),
      estimatedHours:     task.estimatedHours,
      complexity:         task.complexity || 3,
      speedRatio:         r(speedRatio),
      complexityWeight,
      weightedSpeedValue: r(weightedSpeedValue),
      completedOnTime,
      daysEarlyOrLate:    r(daysEarlyOrLate),
      completionState,
      pssAfterThis:       r(newPSS),
    });

    // Update PSS in BStudentProfile
    await BStudentProfile.findOneAndUpdate(
      { userId: studentId },
      {
        'pss.score':       r(newPSS),
        'pss.dataPoints':  dataPoints,
        'pss.lastUpdated': now,
        'pss.isEstimated': dataPoints < 3,
      },
      { upsert: true }
    );

    // Recalculate prediction
    const prediction = await recalculate({
      studentId,
      projectId:         task.projectId,
      triggerType:       'task-completed',
      triggeredByTaskId: task._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Task completed',
      task,
      newPSS:  r(newPSS),
      prediction,
    });
  } catch (err) {
    console.error('completeTask error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to complete task' });
  }
}

// ── UNCHANGED: all existing functions below ───────────────────────────────────

export async function createTask(req, res) {
  try {
    const { projectId, name, description, assigneeId, dueDate, taskType, complexity, status } = req.body;
    if (!projectId || !name) return res.status(400).json({ message: 'Project ID and name are required' });
    const project = await BProject.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const task = await BTask.create({
      projectId, name, description, assigneeId,
      assignedById: req.user.id,
      status: status || 'New',
      taskType, complexity,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
    res.status(201).json({ task: populatedTask });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function listTasks(req, res) {
  try {
    const { projectId } = req.query;
    // Tasks are PRIVATE — filter by assigneeId always
    // If projectId given, still only return tasks for this student in that project
    const filter = projectId
      ? { projectId, assigneeId: req.user.id }
      : { assigneeId: req.user.id };

    const tasks = await BTask.find(filter)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ tasks });
  } catch (err) {
    console.error('List tasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getTask(req, res) {
  try {
    const task = await BTask.findById(req.params.id)
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateTask(req, res) {
  try {
    const updatedTask = await BTask.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.json({ task: updatedTask });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const updates    = { status };
    const now        = new Date();
    if (status === 'In Progress') updates.startedAt   = now;
    if (status === 'Completed')   updates.completedAt = now;
    const task = await BTask.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('assigneeId',   'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function addProofCommit(req, res) {
  try {
    const { sha } = req.body;
    const task    = await BTask.findById(req.params.id).populate('projectId');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const repoUrl = task.projectId.githubRepoUrl;
    const match   = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ message: 'Invalid repo URL' });
    const [, owner, repo] = match;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
    });
    const cd = response.data;
    task.proofCommits.push({
      sha: cd.sha, message: cd.commit.message,
      authorName: cd.commit.author.name, authoredAt: new Date(cd.commit.author.date),
    });
    await task.save();
    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email').lean();
    res.status(201).json({ message: 'Proof commit added', task: populatedTask });
  } catch (err) {
    console.error('Add proof commit error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to add proof commit' });
  }
}

export async function addProofFile(req, res) {
  try {
    const fileUrl = req.file?.path;
    if (!fileUrl) return res.status(400).json({ message: 'No file uploaded' });
    const task = await BTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.proofFiles.push({ url: fileUrl, addedBy: req.user.id, addedAt: new Date() });
    await task.save();
    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email').lean();
    res.status(201).json({ message: 'Proof file added', task: populatedTask });
  } catch (err) {
    console.error('Add proof file error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getRepoCommits(req, res) {
  try {
    const project = await BProject.findById(req.params.projectId);
    if (!project || !project.githubRepoUrl) return res.status(404).json({ message: 'Project or repo not found' });
    const match = project.githubRepoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) return res.status(400).json({ message: 'Invalid repo URL' });
    const [, owner, repo] = match;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      params:  { per_page: 50 },
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    });
    const commits = response.data.map(c => ({
      sha: c.sha, message: c.commit.message,
      authorName: c.commit.author.name, authoredAt: c.commit.author.date, html_url: c.html_url,
    }));
    res.json({ commits });
  } catch (err) {
    console.error('GitHub API Error:', err.response?.status, err.response?.data?.message || err.message);
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || 'Failed to fetch commits' });
  }
}

export const addTaskProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `uploads/${req.file.filename}`;
    const task = await BTask.findByIdAndUpdate(
      req.params.id,
      { $push: { proofFiles: { url: fileUrl, type: req.file.mimetype, uploadedAt: new Date() } } },
      { new: true }
    );
    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE TWO FUNCTIONS TO THE BOTTOM OF YOUR EXISTING taskController.js
// Also add this import at the top of taskController.js:
//   import { rebalanceProject, rebalanceAll as rebalanceAllProjects } from '../../services/rebalanceService.js';
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/tasks/rebalance/:projectId
// Rebalances due dates for one project based on current workload + priority
export async function rebalanceTasks(req, res) {
  try {
    const { projectId } = req.params;
    const studentId     = req.user._id || req.user.id;

    const result = await rebalanceProject({ studentId, projectId });

    res.json({
      success: true,
      message: `Rebalanced ${result.updated} tasks. Daily hours allocated: ${result.dailyHours}hrs`,
      ...result,
    });
  } catch (err) {
    console.error('rebalanceTasks error:', err);
    res.status(500).json({ message: err.message });
  }
}

// POST /api/tasks/rebalance-all
// Rebalances ALL active projects for the student
// Triggered automatically when: priority changes, new project tasks generated
export async function rebalanceAll(req, res) {
  try {
    const studentId = req.user._id || req.user.id;

    const results = await rebalanceAllProjects(studentId);

    res.json({
      success: true,
      message: `Rebalanced ${results.length} project(s)`,
      results,
    });
  } catch (err) {
    console.error('rebalanceAll error:', err);
    res.status(500).json({ message: err.message });
  }
}
// Helper
