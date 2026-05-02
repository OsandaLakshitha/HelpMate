// projectController.js — cascade version
import BProject from '../../models/Bmodels/BProject.js';
import BProjectMember from '../../models/Bmodels/BProjectMember.js';
import { verifyRepoExists, fetchCommits } from '../../utils/github.js';
import { extractPdfText, deletePdfFile } from '../../services/Bservices/Pdfservice.js';
import { generateProjectDescription } from '../../services/Bservices/Claudeservice.js';
import { recalculateAllForStudent } from '../../services/Bservices/Predictionengine.js';

// ── createProject
export async function createProject(req, res) {
  try {
    const {
      title,
      description,
      approach,
      githubRepoUrl,
      supervisorEmail,
      dueDate,
      complexity,
      projectType,
      testMode = false,
      members: membersRaw,
      memberIds: memberIdsRaw,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title and due date are required' });
    }

    let members = [];
    let memberIds = [];
    try {
      members = typeof membersRaw === 'string' ? JSON.parse(membersRaw) : (membersRaw || []);
      memberIds = typeof memberIdsRaw === 'string' ? JSON.parse(memberIdsRaw) : (memberIdsRaw || []);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid members data' });
    }

    const creatorMember = members?.find(m => String(m.userId) === String(req.user.id));
    if (!creatorMember || !creatorMember.componentName) {
      return res.status(400).json({ success: false, message: 'Please specify your component/role in the project' });
    }

    let githubVerified = false;
    if (githubRepoUrl) {
      const v = await verifyRepoExists(githubRepoUrl);
      githubVerified = v.ok;
    }

    let pdfName = null;
    let pdfPath = null;
    let pdfText = null;
    let generatedDesc = null;

    if (req.file) {
      pdfName = req.file.originalname;
      pdfPath = req.file.path;
      pdfText = await extractPdfText(pdfPath);
    }

    generatedDesc = await generateProjectDescription(pdfText, approach);

    const project = await BProject.create({
      title,
      description,
      approach: approach || null,
      githubRepoUrl,
      githubVerified,
      creatorId: req.user.id,
      supervisorEmail,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      complexity,
      projectType,
      testMode,
      memberIds: memberIds.length ? memberIds : [req.user.id],
      status: 'Open',
      pdfName,
      pdfPath,
      pdfText,
      generatedDesc,
    });

    if (members && members.length > 0) {
      const memberPromises = members.map(member =>
        BProjectMember.create({
          projectId: project._id,
          userId: member.userId,
          email: member.email,
          componentName: member.componentName || '',
          contributionTotal: 0,
          activeTimeMinutes: 0,
        })
      );
      await Promise.all(memberPromises);
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    if (req.file?.path) deletePdfFile(req.file.path);
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message,
    });
  }
}

// ── listProjects
export async function listProjects(req, res) {
  try {
    const { mine, search } = req.query;
    const filter = mine === 'true' ? { creatorId: req.user.id } : { memberIds: req.user.id };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const projects = await BProject.find(filter).sort({ updatedAt: -1 }).lean();
    return res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    return res.status(500).json({ message: 'Failed to fetch projects' });
  }
}

// ── getProject
export async function getProject(req, res) {
  try {
    const { id } = req.params;
    const project = await BProject.findById(id).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const members = await BProjectMember.find({ projectId: id })
      .populate('userId', 'firstName lastName email')
      .lean();

    return res.json({ project, members });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({ message: 'Failed to fetch project' });
  }
}

// ── updateProject — full cascade
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.githubRepoUrl) {
      const v = await verifyRepoExists(updates.githubRepoUrl);
      updates.githubVerified = v.ok;
    }

    const criticalChange =
      updates.dueDate !== undefined ||
      updates.complexity !== undefined;

    const project = await BProject.findByIdAndUpdate(id, updates, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (criticalChange && project.memberIds?.length) {
      let successCount = 0;
      let failCount = 0;

      for (const memberId of project.memberIds) {
        try {
          await recalculateAllForStudent(memberId, 'project-updated');
          successCount++;
        } catch (recalcErr) {
          failCount++;
          console.warn(
            `Cascade recalculate for member ${memberId} after project update failed (non-fatal):`,
            recalcErr.message
          );
        }
      }

      console.log(
        `[updateProject] Cascaded ${successCount}/${project.memberIds.length} members` +
        (failCount > 0 ? ` (${failCount} failed)` : '')
      );
    }

    return res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ message: 'Failed to update project' });
  }
}

// ── deleteProject — full cascade
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const project = await BProject.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (String(project.creatorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only creator can delete' });
    }

    const affectedMemberIds = [...(project.memberIds || [])];

    await BProjectMember.deleteMany({ projectId: id });

    const { default: BTask } = await import('../../models/Bmodels/BTask.js');
    await BTask.deleteMany({ projectId: id });

    const { default: BPrediction } = await import('../../models/Bmodels/Bprediction.js');
    const { default: BDailyLog } = await import('../../models/Bmodels/Bdailylog.js');
    const { default: BCompletion } = await import('../../models/Bmodels/Bcompletion.js');

    const [predCount, logCount, compCount] = await Promise.all([
      BPrediction.deleteMany({ projectId: id }),
      BDailyLog.deleteMany({ projectId: id }),
      BCompletion.deleteMany({ projectId: id }),
    ]);

    console.log(
      `[deleteProject] Cleaned up: ${predCount.deletedCount} predictions, ` +
      `${logCount.deletedCount} daily logs, ${compCount.deletedCount} completions`
    );

    await project.deleteOne();

    for (const memberId of affectedMemberIds) {
      try {
        await recalculateAllForStudent(memberId, 'project-deleted');
      } catch (cascadeErr) {
        console.warn(`[deleteProject] Cascade for member ${memberId} failed (non-fatal):`, cascadeErr.message);
      }
    }

    return res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ message: 'Failed to delete project' });
  }
}

// ── closeProject — full cascade
export async function closeProject(req, res) {
  try {
    const { id } = req.params;
    const project = await BProject.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.status = 'Closed';
    await project.save();

    const { default: BPrediction } = await import('../../models/Bmodels/Bprediction.js');
    const result = await BPrediction.updateMany(
      { projectId: id },
      {
        $set: {
          status: 'complete',
          rapStatus: 'complete',
          rapMessage: 'Project has been closed.',
          lastTriggerType: 'project-closed',
          lastTriggerDate: new Date(),
        },
      }
    );

    console.log(`[closeProject] Marked ${result.modifiedCount} predictions as complete`);

    if (project.memberIds?.length) {
      for (const memberId of project.memberIds) {
        try {
          await recalculateAllForStudent(memberId, 'project-closed');
        } catch (cascadeErr) {
          console.warn(`[closeProject] Cascade for member ${memberId} failed (non-fatal):`, cascadeErr.message);
        }
      }
    }

    return res.json({ project });
  } catch (error) {
    console.error('Close project error:', error);
    return res.status(500).json({ message: 'Failed to close project' });
  }
}

// ── verifyRepo
export async function verifyRepo(req, res) {
  try {
    const { repoUrl } = req.query;
    if (!repoUrl) return res.status(400).json({ valid: false, message: 'Missing repoUrl parameter' });

    const result = await verifyRepoExists(repoUrl);
    if (!result.ok) {
      let message = 'Repository not found. Please check the URL.';
      if (result.status === 404) message = 'Repository not found or is private.';
      if (result.status === 403) message = 'GitHub API rate limit exceeded. Try again later.';
      return res.status(200).json({ valid: false, message });
    }

    return res.status(200).json({ valid: true, message: 'Repository verified successfully' });
  } catch (err) {
    console.error('verifyRepo error:', err);
    return res.status(500).json({
      valid: false,
      message: 'Error verifying repository',
      error: err.message,
    });
  }
}
// ── getProjectStats — Robust version with error handling ───────────────────
export async function getProjectStats(req, res) {
  try {
    const { id: projectId } = req.params;  // ← Route uses :id, we rename to projectId
    const studentId = req.user?._id || req.user?.id;

    // Validate inputs
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Load project
    const project = await BProject.findById(projectId).lean();
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify student is member of project
    if (!project.memberIds?.includes(studentId.toString()) && project.creatorId?.toString() !== studentId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const now = new Date();
    const startDate = new Date(project.startDate || project.createdAt);
    const dueDate = new Date(project.dueDate);

    // Time calculations with safety checks
    const totalDuration = Math.max(1, (dueDate - startDate) / 86400000);
    const elapsed = Math.max(0, (now - startDate) / 86400000);
    const daysLeft = Math.max(0, (dueDate - now) / 86400000);
    const percentTimeElapsed = Math.min(100, Math.round((elapsed / totalDuration) * 100));

    // Load tasks with error handling
    let allTasks = [];
    try {
      allTasks = await BTask.find({ projectId, assigneeId: studentId }).lean();
    } catch (taskErr) {
      console.warn('⚠ Task query warning:', taskErr.message);
      allTasks = [];
    }

    const totalTasks = allTasks.length || 0;
    const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = totalTasks - completedTasks;

    // Expected progress
    const expectedProgressPct = percentTimeElapsed;
    const expectedCompleted = Math.min(totalTasks, Math.round((expectedProgressPct / 100) * totalTasks));

    // Ideal pace (avoid division by zero)
    const idealPace = daysLeft > 0 ? parseFloat((pendingTasks / daysLeft).toFixed(2)) : pendingTasks;

    // Actual progress
    const actualProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Actual pace from logs with error handling
    let recentLogs = [];
    try {
      recentLogs = await BDailyLog.find({
        studentId,
        projectId,
        date: { $gte: new Date(Date.now() - 14 * 86400000) }
      }).sort({ date: -1 }).limit(14).lean();
    } catch (logErr) {
      console.warn('⚠ DailyLog query warning:', logErr.message);
      recentLogs = [];
    }

    const totalCompletedInPeriod = recentLogs.reduce((sum, log) => sum + (log.completedTaskCount || 0), 0);
    const actualPace = recentLogs.length > 0 ? parseFloat((totalCompletedInPeriod / recentLogs.length).toFixed(2)) : 0;

    // Target hit rate
    const daysWithTarget = recentLogs.filter(log => log.targetTaskCount > 0);
    const targetHitRate = daysWithTarget.length > 0
      ? Math.round((daysWithTarget.filter(log => log.targetMet).length / daysWithTarget.length) * 100)
      : 0;

    // Comparison metrics
    const progressGap = actualProgressPct - expectedProgressPct;
    const paceGap = parseFloat((actualPace - idealPace).toFixed(2));

    // Status classification
    let progressStatus = 'on-track';
    if (progressGap < -20) progressStatus = 'critical';
    else if (progressGap < -10) progressStatus = 'behind';
    else if (progressGap > 10) progressStatus = 'ahead';

    let paceStatus = 'on-track';
    if (paceGap < -0.5) paceStatus = 'critical';
    else if (paceGap < -0.2) paceStatus = 'behind';
    else if (paceGap > 0.3) paceStatus = 'ahead';

    // Resilience & confidence with fallbacks
    let prediction = null;
    try {
      prediction = await BPrediction.findOne({ studentId, projectId }).sort({ updatedAt: -1 }).lean();
    } catch (predErr) {
      console.warn('⚠ Prediction query warning:', predErr.message);
    }

    const resilienceScore = prediction?.resilienceScore ?? 50;
    const confidence = prediction?.confidence ?? 0.5;

    // Insight message
    let insightMessage = '';
    let insightType = 'info';
    if (progressStatus === 'critical') {
      insightMessage = `🚨 Urgent: You're significantly behind. Focus on completing at least ${Math.ceil(idealPace)} task(s)/day to catch up.`;
      insightType = 'danger';
    } else if (progressStatus === 'behind') {
      insightMessage = `⚠ You're a bit behind. Try to complete ${Math.ceil(idealPace)} task(s) today to get back on track.`;
      insightType = 'warning';
    } else if (progressStatus === 'ahead') {
      insightMessage = `🎉 Great progress! You're ahead of schedule. Maintain your pace or build buffer.`;
      insightType = 'success';
    } else {
      insightMessage = `✅ You're on track! Keep completing ~${idealPace} task(s)/day to finish on time.`;
      insightType = 'info';
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      projectId,
      stats: {
        daysElapsed: Math.round(elapsed),
        daysLeft: Math.round(daysLeft),
        totalDuration: Math.round(totalDuration),
        percentTimeElapsed,
        expectedProgressPct,
        actualProgressPct,
        progressGap,
        progressStatus,
        idealPace,
        actualPace,
        paceGap,
        paceStatus,
        targetHitRate,
        totalTasks,
        expectedCompleted,
        actualCompleted: completedTasks,
        pendingTasks,
        resilienceScore,
        confidence: Math.round(confidence * 100),
        chartData: {
          labels: ['Start', 'Now', 'Due'],
          expected: [0, expectedProgressPct, 100],
          actual: [0, actualProgressPct, actualProgressPct],
        },
        insightMessage,
        insightType,
      },
    });

  } catch (err) {
    // Log full error for debugging
    console.error('❌ getProjectStats CRITICAL ERROR:', {
      message: err.message,
      stack: err.stack,
      params: req.params,
      user: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to load project statistics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}
// ── getProjectCommits
export async function getProjectCommits(req, res) {
  try {
    const { id } = req.params;
    const project = await BProject.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.githubRepoUrl) return res.status(404).json({ message: 'No GitHub repository linked' });

    const commits = await fetchCommits(project.githubRepoUrl);
    return res.status(200).json({ success: true, commits });
  } catch (err) {
    console.error('getProjectCommits error:', err);
    return res.status(500).json({
      message: 'Error fetching commits',
      error: err.message,
    });
  }
}