// ═══════════════════════════════════════════════════════════════════════════
// anomalyDetector.js
//
// Detects unusual task completion behaviour and returns structured warnings.
// Called from completeTask() in taskController.js BEFORE saving BCompletion.
//
// Philosophy:
//   - NEVER block a student from completing a task
//   - ALWAYS save the completion
//   - ALWAYS warn if pattern is suspicious
//   - Let prediction engine decide what to do with flagged data
//   - Multiple patterns can trigger at once
//
// Patterns detected:
//   1. BURST       — 3+ tasks completed within 5 minutes
//   2. SESSION_FLOOD — 8+ tasks completed within 2 hours
//   3. VELOCITY_SPIKE — completing 5× faster than personal average
//   4. FIRST_DAY_DUMP — 50%+ of all project tasks completed in first 24hrs
//   5. NIGHT_SESSION  — consistent completions between 01:00–04:00
//   6. SEQUENTIAL_SKIP — task order skipped (completing #5 before #3)
//
// Returns:
//   {
//     anomalyDetected: boolean,
//     patterns: [{ type, severity, message, data }],
//     worstSeverity: 'low' | 'medium' | 'high' | null,
//     countForRatio: boolean,   // false = exclude from studentRatio
//     countForColdStart: boolean
//   }
// ═══════════════════════════════════════════════════════════════════════════

import BCompletion from '../../models/Bmodels/Bcompletion.js';
import BTask       from '../../models/Bmodels/BTask.js';

// ── Thresholds ────────────────────────────────────────────────────────────────
const T = {
  BURST_TASKS_COUNT:     3,    // 3+ tasks = burst
  BURST_WINDOW_MIN:      5,    // within 5 minutes
  SESSION_TASKS_COUNT:   8,    // 8+ tasks = session flood
  SESSION_WINDOW_HR:     2,    // within 2 hours
  VELOCITY_MULTIPLIER:   4,    // 4× faster than average = spike
  VELOCITY_MIN_SAMPLES:  3,    // need at least 3 past completions to compare
  FIRST_DAY_PCT:         0.50, // completing 50%+ of tasks on day 1
  FIRST_DAY_HOURS:       24,   // "first day" = within 24hrs of project start
  NIGHT_HOUR_START:      1,    // 01:00
  NIGHT_HOUR_END:        4,    // 04:00
  NIGHT_MIN_OCCURRENCES: 3,    // 3+ night sessions = flag as pattern
};

// ─────────────────────────────────────────────────────────────────────────────
export async function detectAnomalies({ studentId, projectId, task, now }) {
  const patterns = [];

  try {
    await Promise.all([
      checkBurst(studentId, projectId, now, patterns),
      checkSessionFlood(studentId, projectId, now, patterns),
      checkVelocitySpike(studentId, task, now, patterns),
      checkFirstDayDump(studentId, projectId, task, now, patterns),
      checkNightSession(studentId, now, patterns),
      checkSequentialSkip(studentId, projectId, task, patterns),
    ]);
  } catch (err) {
    console.error('anomalyDetector error:', err.message);
    // Never crash completeTask — return clean on error
    return safeResult([]);
  }

  return safeResult(patterns);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BURST — 3+ tasks in 5 minutes
// Most common form of gaming: student clicks through tasks rapidly
// ─────────────────────────────────────────────────────────────────────────────
async function checkBurst(studentId, projectId, now, patterns) {
  const windowStart = new Date(now.getTime() - T.BURST_WINDOW_MIN * 60 * 1000);

  const recentCount = await BCompletion.countDocuments({
    studentId,
    projectId,
    createdAt: { $gte: windowStart },
  });

  if (recentCount >= T.BURST_TASKS_COUNT) {
    patterns.push({
      type:     'BURST',
      severity: recentCount >= 6 ? 'high' : 'medium',
      message:  `${recentCount + 1} tasks completed within ${T.BURST_WINDOW_MIN} minutes`,
      data:     { tasksInWindow: recentCount + 1, windowMinutes: T.BURST_WINDOW_MIN },
      excludeFromRatio: true,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SESSION FLOOD — 8+ tasks within 2 hours
// Completing a whole week's work in a single sitting
// ─────────────────────────────────────────────────────────────────────────────
async function checkSessionFlood(studentId, projectId, now, patterns) {
  const windowStart = new Date(now.getTime() - T.SESSION_WINDOW_HR * 60 * 60 * 1000);

  const sessionCount = await BCompletion.countDocuments({
    studentId,
    projectId,
    createdAt: { $gte: windowStart },
  });

  if (sessionCount >= T.SESSION_TASKS_COUNT) {
    patterns.push({
      type:     'SESSION_FLOOD',
      severity: 'medium',
      message:  `${sessionCount + 1} tasks completed in ${T.SESSION_WINDOW_HR} hours — unusually high session volume`,
      data:     { tasksInSession: sessionCount + 1, windowHours: T.SESSION_WINDOW_HR },
      excludeFromRatio: false, // don't exclude — could be genuine catch-up
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. VELOCITY SPIKE — completing 4× faster than personal average
// Uses actualDays from BCompletion history to compare
// ─────────────────────────────────────────────────────────────────────────────
async function checkVelocitySpike(studentId, task, now, patterns) {
  // Get student's average time per task from recent completions
  const pastCompletions = await BCompletion.find({
    studentId,
    countForPSS: true,              // only genuine completions
    actualDays:  { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  if (pastCompletions.length < T.VELOCITY_MIN_SAMPLES) return; // not enough history

  const avgDays = pastCompletions.reduce((s, c) => s + c.actualDays, 0) / pastCompletions.length;

  // How long did this task take?
  const taskStarted = task.startedAt || task.createdAt;
  const thisTaskDays = Math.max(0.001, (now - new Date(taskStarted)) / 86400000);

  const velocityRatio = avgDays / thisTaskDays; // >1 = faster than average

  if (velocityRatio >= T.VELOCITY_MULTIPLIER) {
    patterns.push({
      type:     'VELOCITY_SPIKE',
      severity: velocityRatio >= 10 ? 'high' : 'medium',
      message:  `Task completed ${velocityRatio.toFixed(1)}× faster than your average pace (avg: ${(avgDays * 24).toFixed(1)}hrs per task, this task: ${(thisTaskDays * 24).toFixed(1)}hrs)`,
      data:     { velocityRatio: Math.round(velocityRatio * 10) / 10, avgDays, thisTaskDays },
      excludeFromRatio: velocityRatio >= T.VELOCITY_MULTIPLIER,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FIRST DAY DUMP — completing 50%+ of project tasks within 24hrs of start
// Student may have done all work before using the system
// ─────────────────────────────────────────────────────────────────────────────
async function checkFirstDayDump(studentId, projectId, task, now, patterns) {
  // Only check within first 24 hours of project
  const projectStart = task.projectCreatedAt || (
    await BTask.findOne({ projectId, assigneeId: studentId })
      .sort({ createdAt: 1 }).lean()
  )?.createdAt;

  if (!projectStart) return;

  const hoursIntoProject = (now - new Date(projectStart)) / 3600000;
  if (hoursIntoProject > T.FIRST_DAY_HOURS) return; // past first day — skip

  // Count completions in first 24hrs
  const totalTasks = await BTask.countDocuments({ projectId, assigneeId: studentId });
  const firstDayCompletions = await BCompletion.countDocuments({
    studentId,
    projectId,
    createdAt: { $gte: new Date(new Date(projectStart).getTime()) },
  });

  const pct = firstDayCompletions / Math.max(1, totalTasks);

  if (pct >= T.FIRST_DAY_PCT && firstDayCompletions >= 3) {
    patterns.push({
      type:     'FIRST_DAY_DUMP',
      severity: 'medium',
      message:  `${Math.round(pct * 100)}% of project tasks completed within first 24 hours`,
      data:     { completedPct: Math.round(pct * 100), firstDayCompletions, totalTasks },
      excludeFromRatio: false, // keep in ratio — student may have frontloaded genuine work
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NIGHT SESSION — completing tasks between 01:00–04:00
// Doesn't flag once — flags if it's a repeated pattern (3+ times)
// This is a low-severity wellbeing flag, not a gaming flag
// ─────────────────────────────────────────────────────────────────────────────
async function checkNightSession(studentId, now, patterns) {
  const hour = now.getHours();
  if (hour < T.NIGHT_HOUR_START || hour > T.NIGHT_HOUR_END) return;

  // Count past night completions
  const nightCompletions = await BCompletion.countDocuments({
    studentId,
    $expr: {
      $and: [
        { $gte: [{ $hour: '$createdAt' }, T.NIGHT_HOUR_START] },
        { $lte: [{ $hour: '$createdAt' }, T.NIGHT_HOUR_END] },
      ],
    },
  });

  if (nightCompletions >= T.NIGHT_MIN_OCCURRENCES) {
    patterns.push({
      type:     'NIGHT_SESSION',
      severity: 'low',
      message:  `Tasks completed between 1am–4am on ${nightCompletions + 1} occasions — consider your sleep schedule 🌙`,
      data:     { nightOccurrences: nightCompletions + 1, currentHour: hour },
      excludeFromRatio: false, // never exclude — student is working, just at odd hours
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SEQUENTIAL SKIP — completing a task out of order
// e.g. completing task #5 when task #3 is still New
// Low severity — just informational
// ─────────────────────────────────────────────────────────────────────────────
async function checkSequentialSkip(studentId, projectId, task, patterns) {
  if (!task.order || task.order <= 1) return;

  // Any pending tasks with lower order number?
  const skippedCount = await BTask.countDocuments({
    projectId,
    assigneeId: studentId,
    order:      { $lt: task.order },
    status:     { $ne: 'Completed' },
  });

  if (skippedCount > 0) {
    patterns.push({
      type:     'SEQUENTIAL_SKIP',
      severity: 'low',
      message:  `Task #${task.order} completed while ${skippedCount} earlier task(s) are still pending`,
      data:     { skippedCount, completedOrder: task.order },
      excludeFromRatio: false,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// safeResult — builds the final return object
// ─────────────────────────────────────────────────────────────────────────────
function safeResult(patterns) {
  const anomalyDetected = patterns.length > 0;

  // Severity ranking
  const RANK = { high: 3, medium: 2, low: 1, null: 0 };
  const worstSeverity = patterns.reduce((worst, p) => {
    return RANK[p.severity] > RANK[worst] ? p.severity : worst;
  }, null);

  // Exclude from ratio if ANY pattern says to
  const excludeFromRatio = patterns.some(p => p.excludeFromRatio);

  return {
    anomalyDetected,
    patterns: patterns.map(({ excludeFromRatio: _, ...p }) => p), // clean up internal flag
    worstSeverity,
    countForRatio:     !excludeFromRatio,
    countForColdStart: worstSeverity !== 'high', // high severity = don't count toward unlock
  };
}