import BTask          from '../../models/Bmodels/BTask.js';
import BProject       from '../../models/Bmodels/BProject.js';
import BProjectMember from '../../models/Bmodels/BProjectMember.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import { recalculate } from './Predictionengine.js';

const PRIORITY_WEIGHTS = { high: 1.5, medium: 1.0, low: 0.6 };

// ── Add business days (skip weekends) ─────────────────────────────────────────
function addWorkdays(from, days) {
  const date  = new Date(from);
  let   added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

// ── Rebalance one project's task due dates ────────────────────────────────────
export async function rebalanceProject({ studentId, projectId }) {
  const project = await BProject.findById(projectId);
  if (!project) throw new Error('Project not found');

  const projectDue = new Date(project.dueDate);
  const now        = new Date();

  // Get student profile for available time
  const profile       = await BStudentProfile.findOne({ userId: studentId });
  const availableTime = profile?.availableTime || { weekdays: 2, weekends: 4 };
  const dailyTotal    = ((availableTime.weekdays * 5) + (availableTime.weekends * 2)) / 7;

  // Get all active projects to calculate hybrid share
  const allMembers = await BProjectMember.find({ userId: studentId })
    .populate('projectId').lean();

  const activeMembers = allMembers.filter(m =>
    m.projectId &&
    m.projectId.status !== 'Closed' &&
    new Date(m.projectId.dueDate) > now
  );

  // Calculate effective weights
  const weightedProjects = activeMembers.map(m => {
    const proj             = m.projectId;
    const dl               = Math.max(1, (new Date(proj.dueDate) - now) / 86400000);
    const deadlinePressure = 1 / dl;
    const priorityWeight   = PRIORITY_WEIGHTS[m.priority || 'medium'];
    return {
      projectId:      String(proj._id),
      effectiveWeight: priorityWeight * deadlinePressure,
      schedulingMode: m.schedulingMode || 'parallel',
      daysLeft:       dl,
    };
  });

  const totalWeight    = weightedProjects.reduce((s, p) => s + p.effectiveWeight, 0) || 1;
  const thisRecord     = weightedProjects.find(p => p.projectId === String(projectId));
  const thisWeight     = thisRecord?.effectiveWeight || 1;
  const schedulingMode = thisRecord?.schedulingMode  || 'parallel';

  let dailyForThis;
  const daysLeft = Math.max(1, (projectDue - now) / 86400000);

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

  // Get pending tasks sorted by current due date
  const pendingTasks = await BTask.find({
    projectId,
    assigneeId: studentId,
    status:     'New',
  }).sort({ dueDate: 1 });

  if (pendingTasks.length === 0) return { updated: 0 };

  // Shift due dates sequentially from today
  let cursor      = new Date(now);
  let updatedCount = 0;

  for (const task of pendingTasks) {
    const hoursNeeded = task.estimatedHours || 2;
    const daysNeeded  = Math.max(1, Math.ceil(hoursNeeded / dailyForThis));

    // New due date = cursor + daysNeeded
    let newDue = addWorkdays(cursor, daysNeeded);

    // Cap at project deadline — never exceed it
    if (newDue > projectDue) newDue = new Date(projectDue);

    // Update task due date and estimatedDays
    await BTask.findByIdAndUpdate(task._id, {
      dueDate:       newDue,
      estimatedDays: daysNeeded,
    });

    cursor = new Date(newDue);
    updatedCount++;
  }

  // Mark rebalanced timestamp
  await BProjectMember.findOneAndUpdate(
    { projectId, userId: studentId },
    { lastRebalancedAt: now }
  );

  // Recalculate prediction after rebalance
  await recalculate({ studentId, projectId, triggerType: 'rebalance' });

  return { updated: updatedCount, dailyHours: Math.round(dailyForThis * 100) / 100 };
}

// ── Rebalance ALL active projects for a student ───────────────────────────────
export async function rebalanceAll(studentId) {
  const allMembers = await BProjectMember.find({ userId: studentId })
    .populate('projectId').lean();

  const activeProjects = allMembers
    .filter(m => m.projectId && m.projectId.status !== 'Closed')
    .sort((a, b) => new Date(a.projectId.dueDate) - new Date(b.projectId.dueDate));
  // Sort by earliest deadline first — protects urgent projects

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
      console.warn(`Rebalance failed for project ${m.projectId._id}:`, err.message);
    }
  }

  return results;
}