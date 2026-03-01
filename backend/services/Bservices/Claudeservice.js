import BTask           from '../../models/Bmodels/BTask.js';
import BProject        from '../../models/Bmodels/BProject.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import BPrediction     from '../../models/Bmodels/Bprediction.js';
import BCompletion     from '../../models/Bmodels/Bcompletion.js';
import BProjectMember  from '../../models/Bmodels/BProjectMember.js';

// ── Priority weights ──────────────────────────────────────────────────────────
const PRIORITY_WEIGHTS = { high: 1.5, medium: 1.0, low: 0.6 };

export const recalculate = async ({
  studentId,
  projectId,
  triggerType       = 'initial',
  triggeredByTaskId = null,
}) => {
  try {
    const project = await BProject.findById(projectId);
    if (!project) throw new Error('Project not found');

    const profile       = await BStudentProfile.findOne({ userId: studentId });
    const availableTime = profile?.availableTime || { weekdays: 2, weekends: 4 };
    const pss           = profile?.pss?.score    || 0.85;

    const now      = new Date();
    const dueDate  = new Date(project.dueDate);
    const daysLeft = Math.max(0, (dueDate - now) / 86400000);

    const allTasks     = await BTask.find({ projectId, assigneeId: studentId });
    const pendingTasks = allTasks.filter(t => t.status !== 'Completed');
    const doneTasks    = allTasks.filter(t => t.status === 'Completed');

    // ── Hard overrides ────────────────────────────────────────────────────────
    if (allTasks.length === 0) {
      return await upsert(studentId, projectId, {
        status: 'not-started', lastTriggerType: triggerType, lastTriggerDate: now,
      });
    }
    if (pendingTasks.length === 0) {
      return await upsert(studentId, projectId, {
        status: 'complete', lastTriggerType: triggerType, lastTriggerDate: now,
      });
    }
    if (daysLeft <= 0) {
      return await upsert(studentId, projectId, {
        status: 'in-danger', completionScore: 0,
        lastTriggerType: triggerType, lastTriggerDate: now,
      });
    }

    // ── Cold start — need 4 completions across ALL projects ───────────────────
    const totalCompletions = await BCompletion.countDocuments({ studentId });
    if (totalCompletions < 4) {
      return await upsert(studentId, projectId, {
        status:               'not-started',
        completionScore:      null,
        confidence:           0,
        daysLeft:             Math.round(daysLeft),
        paceDelta:            0,
        dataPointsUsed:       totalCompletions,
        isEstimated:          true,
        coldStart:            true,
        completionsNeeded:    Math.max(0, 4 - totalCompletions),
        completedThisProject: doneTasks.length,
        lastTriggerType:      triggerType,
        lastTriggerDate:      now,
        triggeredByTaskId:    triggeredByTaskId || null,
      });
    }

    // ── HYBRID: Priority × Deadline Pressure ─────────────────────────────────
    // Get all active projects this student is part of
    const allMembers = await BProjectMember.find({ userId: studentId })
      .populate('projectId').lean();

    const activeMembers = allMembers.filter(m =>
      m.projectId &&
      m.projectId.status !== 'Closed' &&
      new Date(m.projectId.dueDate) > now
    );

    // Calculate effective weight per project
    // effectiveWeight = priorityWeight × (1 / daysLeft)
    // closer deadline = higher pressure = more time share
    const weightedProjects = activeMembers.map(m => {
      const proj             = m.projectId;
      const dl               = Math.max(1, (new Date(proj.dueDate) - now) / 86400000);
      const deadlinePressure = 1 / dl;
      const priorityWeight   = PRIORITY_WEIGHTS[m.priority || 'medium'];
      const effectiveWeight  = priorityWeight * deadlinePressure;
      return {
        projectId:      String(proj._id),
        effectiveWeight,
        schedulingMode: m.schedulingMode || 'parallel',
        daysLeft:       dl,
        priority:       m.priority || 'medium',
      };
    });

    const totalEffectiveWeight = weightedProjects.reduce((s, p) => s + p.effectiveWeight, 0) || 1;

    // This project's record
    const thisRecord          = weightedProjects.find(p => p.projectId === String(projectId));
    const thisEffectiveWeight = thisRecord?.effectiveWeight || 1;
    const schedulingMode      = thisRecord?.schedulingMode  || 'parallel';

    // Daily total hours (weighted average across the week)
    const dailyTotal = ((availableTime.weekdays * 5) + (availableTime.weekends * 2)) / 7;

    // Calculate daily hours allocated to THIS project
    let dailyForThis;
    let linearConflictWarning = null;

    if (schedulingMode === 'linear') {
      // Linear — check if any other project has EARLIER deadline
      const earlierProjects = weightedProjects.filter(p =>
        p.projectId !== String(projectId) && p.daysLeft < daysLeft
      );

      if (earlierProjects.length === 0) {
        // No earlier deadlines — safe to go fully linear
        dailyForThis = dailyTotal;
      } else {
        // Earlier deadlines exist — protect those first
        // Give earlier projects their proportional share
        // Give this linear project the remaining hours
        const earlierWeight   = earlierProjects.reduce((s, p) => s + p.effectiveWeight, 0);
        const remainingShare  = 1 - (earlierWeight / totalEffectiveWeight);
        dailyForThis          = dailyTotal * Math.max(0.1, remainingShare);
        linearConflictWarning = `${earlierProjects.length} project(s) with earlier deadlines are being protected first. Full linear focus starts after those deadlines pass.`;
      }
    } else {
      // Parallel — hybrid formula share
      dailyForThis = dailyTotal * (thisEffectiveWeight / totalEffectiveWeight);
    }

    // Minimum 0.25 hrs/day to avoid division by zero
    dailyForThis = Math.max(0.25, dailyForThis);
    const timeSharePct = (dailyForThis / dailyTotal) * 100;

    // ── Days needed ───────────────────────────────────────────────────────────
    const graceMs  = 12 * 60 * 60 * 1000;
    const overdue  = pendingTasks.filter(t => t.dueDate && (now - new Date(t.dueDate)) > graceMs);
    const upcoming = pendingTasks.filter(t => !t.dueDate || (now - new Date(t.dueDate)) <= graceMs);

    const overdueDays  = overdue.reduce((s, t) => {
      const daysSince = (now - new Date(t.dueDate)) / 86400000;
      return s + (t.estimatedDays || 1) + daysSince;
    }, 0);
    const upcomingDays = upcoming.reduce((s, t) => s + ((t.estimatedDays || 1) / pss), 0);
    const totalProjectedDays = overdueDays + upcomingDays;

    const effectiveDays = totalProjectedDays * (8 / dailyForThis);

    // ── Completion score + status ─────────────────────────────────────────────
    const CS = (daysLeft / effectiveDays) * 100;
    let status = CS >= 100 ? 'on-track' : CS >= 80 ? 'at-risk' : 'in-danger';

    const concurrentProjects = weightedProjects.length;
    let multiProjectDowngraded = false;
    if (concurrentProjects >= 3 && status === 'on-track' && CS < 115) {
      status = 'at-risk'; multiProjectDowngraded = true;
    }
    if (concurrentProjects >= 2 && status === 'at-risk' && CS < 85) {
      status = 'in-danger'; multiProjectDowngraded = true;
    }

    // ── Pace ──────────────────────────────────────────────────────────────────
    const startDate      = new Date(project.startDate || project.createdAt);
    const totalDuration  = Math.max(1, (dueDate - startDate) / 86400000);
    const elapsed        = Math.max(0, (now - startDate) / 86400000);
    const timeElapsedPct = Math.min(100, (elapsed / totalDuration) * 100);

    const totalWeight       = allTasks.reduce((s, t) => s + (t.complexity || 3), 0);
    const completedWeight   = doneTasks.reduce((s, t) => s + (t.complexity || 3), 0);
    const workCompletionPct = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
    const paceDelta         = workCompletionPct - timeElapsedPct;

    const bufferDays      = daysLeft - effectiveDays;
    const projectedFinish = new Date(now.getTime() + effectiveDays * 86400000);

    const overdueTaskCount = overdue.length;
    const totalOverdueDays = overdue.reduce((s, t) =>
      s + Math.max(0, (now - new Date(t.dueDate)) / 86400000), 0
    );

    const confidence  = Math.min(0.95, 0.30 + totalCompletions * 0.05);
    const isEstimated = totalCompletions < 6;

    return await upsert(studentId, projectId, {
      status,
      completionScore:        Math.round(CS),
      pssAtCalculation:       pss,
      projectedFinishDate:    projectedFinish,
      daysLeft:               Math.round(daysLeft),
      projectedDaysNeeded:    Math.round(effectiveDays),
      bufferDays:             Math.round(bufferDays),
      workCompletionPct:      Math.round(workCompletionPct),
      timeElapsedPct:         Math.round(timeElapsedPct),
      paceDelta:              Math.round(paceDelta),
      concurrentProjects,
      timeSharePct:           Math.round(timeSharePct),
      dailyHoursAllocated:    Math.round(dailyForThis * 100) / 100,
      schedulingMode,
      priority:               thisRecord?.priority || 'medium',
      multiProjectDowngraded,
      overdueTaskCount,
      totalOverdueDays:       Math.round(totalOverdueDays),
      confidence:             Math.round(confidence * 100) / 100,
      dataPointsUsed:         totalCompletions,
      coldStart:              false,
      completionsNeeded:      0,
      isEstimated,
      linearConflictWarning,
      lastTriggerType:        triggerType,
      lastTriggerDate:        now,
      triggeredByTaskId:      triggeredByTaskId || null,
    });

  } catch (err) {
    console.error('predictionEngine error:', err.message);
    return null;
  }
};

const upsert = (studentId, projectId, data) =>
  BPrediction.findOneAndUpdate(
    { studentId, projectId },
    { $set: data },
    { upsert: true, new: true }
  );