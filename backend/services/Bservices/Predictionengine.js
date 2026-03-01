import BTask from '../../models/Bmodels/BTask.js';
import BProject from '../../models/Bmodels/BProject.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import BPrediction from '../../models/Bmodels/Bprediction.js';
import BCompletion from '../../models/Bmodels/Bcompletion.js';

export const recalculate = async ({ studentId, projectId, triggerType = 'initial', triggeredByTaskId = null }) => {
  try {
    const project = await BProject.findById(projectId);
    if (!project) throw new Error('Project not found');

    const profile       = await BStudentProfile.findOne({ userId: studentId });
    const availableTime = profile?.availableTime || { weekdays: 2, weekends: 4 };
    const pss           = profile?.pss?.score    || 0.85;
    const dataPoints    = profile?.pss?.dataPoints || 0;

    const now     = new Date();
    const dueDate = new Date(project.dueDate);
    const daysLeft = Math.max(0, (dueDate - now) / (1000 * 60 * 60 * 24));

    const allTasks     = await BTask.find({ projectId, assigneeId: studentId });
    const pendingTasks = allTasks.filter(t => t.status !== 'Completed');
    const doneTasks    = allTasks.filter(t => t.status === 'Completed');

    // ── Hard overrides ────────────────────────────────────────────────────
    if (allTasks.length === 0) {
      return await upsert(studentId, projectId, {
        status: 'not-started',
        lastTriggerType: triggerType,
        lastTriggerDate: now,
      });
    }

    if (pendingTasks.length === 0) {
      return await upsert(studentId, projectId, {
        status: 'complete',
        lastTriggerType: triggerType,
        lastTriggerDate: now,
      });
    }

    if (daysLeft <= 0) {
      return await upsert(studentId, projectId, {
        status: 'in-danger',
        completionScore: 0,
        lastTriggerType: triggerType,
        lastTriggerDate: now,
      });
    }

    // ── COLD START CHECK ──────────────────────────────────────────────────
    // Count ALL completions across ALL projects for this student
    const totalCompletionsAllProjects = await BCompletion.countDocuments({ studentId });

    if (totalCompletionsAllProjects < 4) {
      // Not enough data to predict reliably
      // Show progress toward unlocking prediction
      const completedThisProject = doneTasks.length;
      const remaining4 = Math.max(0, 4 - totalCompletionsAllProjects);

      return await upsert(studentId, projectId, {
        status:              'not-started',
        completionScore:     null,
        confidence:          0,
        daysLeft:            Math.round(daysLeft),
        paceDelta:           0,
        dataPointsUsed:      totalCompletionsAllProjects,
        isEstimated:         true,
        coldStart:           true,                        // flag for frontend
        completionsNeeded:   remaining4,                  // how many more to unlock
        completedThisProject,
        lastTriggerType:     triggerType,
        lastTriggerDate:     now,
        triggeredByTaskId:   triggeredByTaskId || null,
      });
    }

    // ── FULL PREDICTION (4+ completions exist) ────────────────────────────
    const graceMs  = 12 * 60 * 60 * 1000;
    const overdue  = pendingTasks.filter(t => t.dueDate && (now - new Date(t.dueDate)) > graceMs);
    const upcoming = pendingTasks.filter(t => !t.dueDate || (now - new Date(t.dueDate)) <= graceMs);

    // Days needed
    const overdueDays  = overdue.reduce((s, t) => {
      const daysSince = (now - new Date(t.dueDate)) / (1000 * 60 * 60 * 24);
      return s + (t.estimatedDays || 1) + daysSince;
    }, 0);
    const upcomingDays = upcoming.reduce((s, t) => s + ((t.estimatedDays || 1) / pss), 0);
    const totalProjectedDays = overdueDays + upcomingDays;

    // Multi-project time share
    const allStudentPending = await BTask.find({ assigneeId: studentId, status: 'New' });
    const thisWeight = pendingTasks.reduce((s, t) => s + (t.complexity || 3), 0);
    const allWeight  = allStudentPending.reduce((s, t) => s + (t.complexity || 3), 0) || thisWeight;
    const timeSharePct = (thisWeight / allWeight) * 100;

    const dailyTotal     = ((availableTime.weekdays * 5) + (availableTime.weekends * 2)) / 7;
    const dailyAllocated = dailyTotal * (timeSharePct / 100);
    const effectiveDays  = totalProjectedDays * (8 / Math.max(0.5, dailyAllocated));

    // Completion Score
    const CS = (daysLeft / effectiveDays) * 100;
    let status = CS >= 100 ? 'on-track' : CS >= 80 ? 'at-risk' : 'in-danger';

    const concurrentProjects = new Set(allStudentPending.map(t => String(t.projectId))).size;

    // Multi-project downgrade
    let multiProjectDowngraded = false;
    if (concurrentProjects >= 3 && status === 'on-track' && CS < 115) {
      status = 'at-risk'; multiProjectDowngraded = true;
    }
    if (concurrentProjects >= 2 && status === 'at-risk' && CS < 85) {
      status = 'in-danger'; multiProjectDowngraded = true;
    }

    // Pace
    const startDate      = new Date(project.startDate || project.createdAt);
    const totalDuration  = Math.max(1, (dueDate - startDate) / (1000 * 60 * 60 * 24));
    const elapsed        = Math.max(0, (now - startDate)  / (1000 * 60 * 60 * 24));
    const timeElapsedPct = Math.min(100, (elapsed / totalDuration) * 100);

    const totalWeight       = allTasks.reduce((s, t) => s + (t.complexity || 3), 0);
    const completedWeight   = doneTasks.reduce((s, t) => s + (t.complexity || 3), 0);
    const workCompletionPct = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
    const paceDelta         = workCompletionPct - timeElapsedPct;

    const bufferDays      = daysLeft - effectiveDays;
    const projectedFinish = new Date(now.getTime() + effectiveDays * 24 * 60 * 60 * 1000);

    const overdueTaskCount = overdue.length;
    const totalOverdueDays = overdue.reduce((s, t) => {
      return s + Math.max(0, (now - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
    }, 0);

    const confidence  = Math.min(0.95, 0.30 + totalCompletionsAllProjects * 0.05);
    const isEstimated = totalCompletionsAllProjects < 6;

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
      multiProjectDowngraded,
      overdueTaskCount,
      totalOverdueDays:       Math.round(totalOverdueDays),
      confidence:             Math.round(confidence * 100) / 100,
      dataPointsUsed:         totalCompletionsAllProjects,
      coldStart:              false,
      completionsNeeded:      0,
      isEstimated,
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