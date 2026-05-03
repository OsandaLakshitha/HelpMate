// dashboardController.js — FIXED VERSION
import BProject from '../../models/Bmodels/BProject.js';
import BTask from '../../models/Bmodels/BTask.js';
import BPrediction from '../../models/Bmodels/Bprediction.js';
import BDailyLog from '../../models/Bmodels/Bdailylog.js';
import { recalculateAllForStudent } from '../../services/Bservices/Predictionengine.js';

const todayKey = () => new Date().toISOString().split('T')[0];

// ── Helper: Get pending tasks sorted for today ─────────────────────────────
function getPendingTasksForToday(tasks, dailyTarget) {
  const pending = tasks.filter(t => t.status !== 'Completed');
  
  return pending
    .sort((a, b) => {
      if (a.order != null && b.order != null) return a.order - b.order;
      if (a.order != null) return -1;
      if (b.order != null) return 1;
      if (a.complexity && b.complexity) {
        const priority = { High: 1, Medium: 2, Low: 3 };
        return priority[a.complexity] - priority[b.complexity];
      }
      return (a.name || '').localeCompare(b.name || '');
    })
    .slice(0, Math.max(3, dailyTarget || 3))
    .map(t => ({
      _id: t._id,
      name: t.name,
      complexity: t.complexity || 'Medium',
      order: t.order,
      estimatedMinutes: t.estimatedMinutes || 30,
    }));
}

export async function getStudentDashboard(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const now = new Date();
    const date = todayKey();

    await recalculateAllForStudent(studentId, 'manual');

    const activeProjects = await BProject.find({
      memberIds: studentId,
      status: 'Open',
      //dueDate: { $gt: now },
    })
      .select('_id title dueDate complexity')
      .lean();

    const projectIds = activeProjects.map(project => project._id);

    const [predictions, tasks, todayLogs] = await Promise.all([
      BPrediction.find({
        studentId,
        projectId: { $in: projectIds },
      }).lean(),

      // ✅ FIXED: Select all needed task fields
      BTask.find({
        assigneeId: studentId,
        projectId: { $in: projectIds },
      })
        .select('_id projectId status name complexity order estimatedMinutes')
        .lean(),

      BDailyLog.find({
        studentId,
        projectId: { $in: projectIds },
        date,
      }).lean(),
    ]);

    const predictionMap = new Map(predictions.map(pred => [String(pred.projectId), pred]));
    const logMap = new Map(todayLogs.map(log => [String(log.projectId), log]));
// ── Helper: Calculate project-specific statistics ──────────────────────────
async function getProjectStats(studentId, projectId, prediction) {
  // Load project details
  const project = await BProject.findById(projectId).lean();
  if (!project) return null;

  const now = new Date();
  const startDate = new Date(project.startDate || project.createdAt);
  const dueDate = new Date(project.dueDate);
  
  // Time calculations
  const totalDuration = Math.max(1, (dueDate - startDate) / 86400000); // days
  const elapsed = Math.max(0, (now - startDate) / 86400000); // days elapsed
  const daysLeft = Math.max(0, (dueDate - now) / 86400000);
  
  // ── IDEAL/EXPECTED METRICS ─────────────────────────────────────────────
  // Expected progress by now (linear assumption)
  const expectedProgressPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  
  // Expected tasks completed by now (based on deadline pressure)
  const allTasks = await BTask.find({ projectId, assigneeId: studentId }).lean();
  const totalTasks = allTasks.length;
  const expectedCompleted = Math.min(totalTasks, Math.round((expectedProgressPct / 100) * totalTasks));
  
  // Ideal pace: tasks/day to finish on time
  const pendingTasks = allTasks.filter(t => t.status !== 'Completed').length;
  const idealPace = daysLeft > 0 ? (pendingTasks / daysLeft).toFixed(2) : pendingTasks;
  
  // ── STUDENT ACTUAL METRICS ──────────────────────────────────────────────
  const actualCompleted = allTasks.filter(t => t.status === 'Completed').length;
  const actualProgressPct = totalTasks > 0 ? Math.round((actualCompleted / totalTasks) * 100) : 0;
  
  // Actual pace: tasks/day student has been completing
  const recentLogs = await BDailyLog.find({ 
    studentId, 
    projectId,
    date: { $gte: new Date(Date.now() - 14 * 86400000) }
  }).sort({ date: -1 }).limit(14).lean();
  
  const totalCompletedInPeriod = recentLogs.reduce((sum, log) => sum + (log.completedTaskCount || 0), 0);
  const actualPace = recentLogs.length > 0 ? (totalCompletedInPeriod / recentLogs.length).toFixed(2) : '0.0';
  
  // Target hit rate: % of days student met their daily target
  const daysWithTarget = recentLogs.filter(log => log.targetTaskCount > 0);
  const targetHitRate = daysWithTarget.length > 0
    ? Math.round((daysWithTarget.filter(log => log.targetMet).length / daysWithTarget.length) * 100)
    : 0;
  
  // ── COMPARISON METRICS ──────────────────────────────────────────────────
  const progressGap = actualProgressPct - expectedProgressPct; // Positive = ahead, negative = behind
  const paceGap = parseFloat(actualPace) - parseFloat(idealPace); // Positive = faster, negative = slower
  
  // Status classification
  let progressStatus = 'on-track';
  if (progressGap < -20) progressStatus = 'critical';
  else if (progressGap < -10) progressStatus = 'behind';
  else if (progressGap > 10) progressStatus = 'ahead';
  
  let paceStatus = 'on-track';
  if (paceGap < -0.5) paceStatus = 'critical';
  else if (paceGap < -0.2) paceStatus = 'behind';
  else if (paceGap > 0.3) paceStatus = 'ahead';
  
  // ── RESILIENCE & CONFIDENCE ─────────────────────────────────────────────
  const resilienceScore = prediction?.resilienceScore ?? 50;
  const confidence = prediction?.confidence ?? 0.5;
  
  return {
    // Time context
    daysElapsed: Math.round(elapsed),
    daysLeft: Math.round(daysLeft),
    totalDuration: Math.round(totalDuration),
    
    // Progress comparison
    expectedProgressPct,
    actualProgressPct,
    progressGap,
    progressStatus, // 'ahead' | 'on-track' | 'behind' | 'critical'
    
    // Pace comparison
    idealPace: parseFloat(idealPace),
    actualPace: parseFloat(actualPace),
    paceGap: parseFloat(paceGap.toFixed(2)),
    paceStatus, // 'ahead' | 'on-track' | 'behind' | 'critical'
    
    // Target adherence
    targetHitRate,
    
    // Task counts
    totalTasks,
    expectedCompleted,
    actualCompleted,
    
    // Resilience & confidence
    resilienceScore,
    confidence: Math.round(confidence * 100),
    
    // Visual chart data (for simple bar/line charts)
    chartData: {
      labels: ['Start', 'Now', 'Due'],
      expected: [0, expectedProgressPct, 100],
      actual: [0, actualProgressPct, actualProgressPct], // Actual stays flat after "Now"
    },
  };
}
    const tasksByProject = new Map();
    for (const task of tasks) {
      const key = String(task.projectId);
      if (!tasksByProject.has(key)) {
        tasksByProject.set(key, { total: 0, completed: 0, pending: 0 });
      }
      const bucket = tasksByProject.get(key);
      bucket.total += 1;
      if (task.status === 'Completed') bucket.completed += 1;
      else bucket.pending += 1;
    }

    const projectCards = activeProjects.map(project => {
      const key = String(project._id);
      const prediction = predictionMap.get(key) || null;
      const taskStats = tasksByProject.get(key) || { total: 0, completed: 0, pending: 0 };
      const todayLog = logMap.get(key) || null;

      const target = prediction?.dailyTarget ?? todayLog?.targetTaskCount ?? 0;
      const completedToday = prediction?.todayCompletedCount ?? todayLog?.completedTaskCount ?? 0;

      let targetStatus = 'not-started';
      if (target > 0) {
        if (completedToday >= target) targetStatus = 'met';
        else if (completedToday > 0) targetStatus = 'in-progress';
        else targetStatus = 'missed';
      }

      // ✅ FIXED: Get tasks for THIS project (inside the map!)
      const projectTasks = tasks.filter(t => String(t.projectId) === key);
      const tasksForToday = getPendingTasksForToday(projectTasks, target);

      return {
        projectId: project._id,
        title: project.title,
        dueDate: project.dueDate,
        complexity: project.complexity,
        totalTasks: taskStats.total,
        completedTasks: taskStats.completed,
        pendingTasks: taskStats.pending,
        dailyTarget: target,
        completedToday,
        targetStatus,
        predictionStatus: prediction?.status || 'not-started',
        rapStatus: prediction?.rapStatus || prediction?.status || 'not-started',
        rapMessage: prediction?.rapMessage || '',
        
        // ✅ FIXED: Include tasksForToday
        tasksForToday,
        
        resilienceScore: prediction?.resilienceScore ?? null,
        trajectoryScore: prediction?.trajectoryScore ?? null,
        confidence: prediction?.confidence ?? null,
        deadlinePressure: prediction?.deadlinePressure ?? null,
        workCompletionPct: prediction?.workCompletionPct ?? null,
        daysLeft: prediction?.daysLeft ?? null,
        complexityCapacity: prediction?.complexityCapacity ?? null,
        loadFactor: prediction?.loadFactor ?? null,
        activeProjects: prediction?.activeProjects ?? 1,
        coldStart: prediction?.coldStart ?? false,
        newProjectPending: prediction?.newProjectPending ?? false,
        dataPointsUsed: prediction?.dataPointsUsed ?? 0,
      };
    });

    const totalProjects = activeProjects.length;
    const totalTasks = tasks.length;
    const totalDailyTarget = projectCards.reduce((sum, project) => sum + (project.dailyTarget || 0), 0);

    const targetSummary = {
      met: projectCards.filter(project => project.targetStatus === 'met').length,
      inProgress: projectCards.filter(project => project.targetStatus === 'in-progress').length,
      missed: projectCards.filter(project => project.targetStatus === 'missed').length,
      notStarted: projectCards.filter(project => project.targetStatus === 'not-started').length,
    };

    return res.status(200).json({
      success: true,
      dashboard: {
        date,
        totalProjects,
        totalTasks,
        totalDailyTarget,
        targetSummary,
        projects: projectCards,
      },
    });
  } catch (err) {
    console.error('getStudentDashboard error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
    });
  }
}