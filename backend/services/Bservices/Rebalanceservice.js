import BTask           from '../../models/Bmodels/BTask.js';
import BProject        from '../../models/Bmodels/BProject.js';
import BProjectMember  from '../../models/Bmodels/BProjectMember.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import { recalculate } from './Predictionengine.js';

const PRIORITY_WEIGHTS = { high: 1.5, medium: 1.0, low: 0.6 };

// ── Set to end of day 23:59:59 ────────────────────────────────────────────────
function setEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── Rebalance one project's task due dates ─────────────────────────────────────
export async function rebalanceProject({ studentId, projectId }) {
  const project = await BProject.findById(projectId);
  if (!project) throw new Error('Project not found');

  const projectDue = setEndOfDay(new Date(project.dueDate));
  const now        = new Date();
  const daysLeft   = Math.max(1, (projectDue - now) / 86400000);

  // Get pending tasks sorted by complexity desc (harder first)
  const pendingTasks = await BTask.find({
    projectId,
    assigneeId: studentId,
    status:     'New',
  }).sort({ complexity: 1, createdAt: 1 });

  if (pendingTasks.length === 0) return { updated: 0 };

  const totalComplexity = pendingTasks.reduce(
    (s, t) => s + (t.complexity || 3), 0
  );

  // ── Get dailyForThis for estimatedDays calculation ────────────────────────
  const profile       = await BStudentProfile.findOne({ userId: studentId });
  const availableTime = profile?.availableTime || { weekdays: 2, weekends: 4 };
  const dailyTotal    = ((availableTime.weekdays * 5) + (availableTime.weekends * 2)) / 7;

  const allMembers = await BProjectMember.find({ userId: studentId })
    .populate('projectId').lean();

  const activeMembers = allMembers.filter(m =>
    m.projectId &&
    m.projectId.status !== 'Closed' &&
    new Date(m.projectId.dueDate) > now
  );

  const weightedProjects = activeMembers.map(m => {
    const proj = m.projectId;
    const dl   = Math.max(1, (new Date(proj.dueDate) - now) / 86400000);
    return {
      projectId:       String(proj._id),
      effectiveWeight: PRIORITY_WEIGHTS[m.priority || 'medium'] * (1 / dl),
      schedulingMode:  m.schedulingMode || 'parallel',
      daysLeft:        dl,
    };
  });

  const totalWeight    = weightedProjects.reduce((s, p) => s + p.effectiveWeight, 0) || 1;
  const thisRecord     = weightedProjects.find(p => p.projectId === String(projectId));
  const thisWeight     = thisRecord?.effectiveWeight || 1;
  const schedulingMode = thisRecord?.schedulingMode  || 'parallel';

  let dailyForThis;
  if (schedulingMode === 'linear') {
    const earlierProjects = weightedProjects.filter(p =>
      p.projectId !== String(projectId) && p.daysLeft < daysLeft
    );
    if (earlierProjects.length === 0) {
      dailyForThis = dailyTotal;
    } else {
      const earlierWeight  = earlierProjects.reduce((s, p) => s + p.effectiveWeight, 0);
      const remainingShare = 1 - (earlierWeight / totalWeight);
      dailyForThis         = dailyTotal * Math.max(0.1, remainingShare);
    }
  } else {
    dailyForThis = dailyTotal * (thisWeight / totalWeight);
  }
  dailyForThis = Math.max(0.25, dailyForThis);

  // ── CUMULATIVE SHARE — assign due dates from TODAY ────────────────────────
  // Each task's due date = today + (running total share × daysLeft)
  // Task 1 ends at 10% of timeline → today + 10% of days
  // Task 2 ends at 30% of timeline → today + 30% of days
  // Task 3 ends at 60% of timeline → today + 60% of days
  // Task 4 ends at 100% of timeline → today + 100% of days (= deadline)
  // Tasks always spread evenly — never stack — never all on deadline

  let cumulativeShare = 0;
  let updatedCount    = 0;
  const taskCount     = pendingTasks.length;

  for (let i = 0; i < taskCount; i++) {
    const task      = pendingTasks[i];
    const taskShare = (task.complexity || 3) / totalComplexity;
    cumulativeShare += taskShare;

    // Days from today for this task's due date
    let daysFromNow = Math.round(daysLeft * cumulativeShare);

    // Minimum: task index + 1 day spacing to prevent same-day due dates
    // Task 0 minimum 1 day, Task 1 minimum 2 days, etc.
    // But cap at daysLeft so we never exceed deadline
    const minDays = Math.min(i + 1, Math.floor(daysLeft));
    daysFromNow   = Math.max(minDays, daysFromNow);

    // Calculate new due date from today
    let newDue = new Date(now.getTime() + daysFromNow * 86400000);

    // Cap at project deadline — never exceed it
    if (newDue > projectDue) newDue = new Date(projectDue);

    // Always end of day — student gets full day
    newDue = setEndOfDay(newDue);

    // estimatedDays for prediction engine (separate from due date)
    const hoursNeeded   = task.estimatedHours || (task.complexity || 3) * 1.5;
    const estimatedDays = Math.max(1, Math.ceil(hoursNeeded / dailyForThis));

    await BTask.findByIdAndUpdate(task._id, {
      dueDate:       newDue,
      estimatedDays: estimatedDays,
    });

    updatedCount++;
  }

  // Mark rebalanced timestamp
  await BProjectMember.findOneAndUpdate(
    { projectId, userId: studentId },
    { lastRebalancedAt: now }
  );

  // Recalculate prediction after rebalance
  await recalculate({ studentId, projectId, triggerType: 'rebalance' });

  return {
    updated:    updatedCount,
    dailyHours: Math.round(dailyForThis * 100) / 100,
    daysLeft:   Math.round(daysLeft),
  };
}

// ── Rebalance ALL active projects for a student ───────────────────────────────
export async function rebalanceAll(studentId) {
  const allMembers = await BProjectMember.find({ userId: studentId })
    .populate('projectId').lean();

  const activeProjects = allMembers
    .filter(m => m.projectId && m.projectId.status !== 'Closed')
    .sort((a, b) => new Date(a.projectId.dueDate) - new Date(b.projectId.dueDate));

  const results = [];
  for (const m of activeProjects) {
    try {
      const result = await rebalanceProject({
        studentId,
        projectId: String(m.projectId._id),
      });
      results.push({
        projectId:    String(m.projectId._id),
        projectTitle: m.projectId.title,
        ...result,
      });
    } catch (err) {
      console.warn(`Rebalance failed for ${m.projectId._id}:`, err.message);
    }
  }
  return results;
}