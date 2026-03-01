import BTask from '../../models/Bmodels/BTask.js';

// Called before task generation.
// Returns freeHours and isWarning.
// If isWarning = true → block generation with a warning message.
export const checkWorkload = async ({ studentId, projectId, projectDueDate, availableTime }) => {
  try {
    const daysUntilDeadline = Math.max(1,
      (new Date(projectDueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const dailyHours          = ((availableTime.weekdays * 5) + (availableTime.weekends * 2)) / 7;
    const totalAvailableHours = daysUntilDeadline * dailyHours;

    // Hours already committed to other active projects
    const otherTasks     = await BTask.find({ assigneeId: studentId, status: 'New', projectId: { $ne: projectId } });
    const committedHours = otherTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);

    const freeHours   = Math.max(0, totalAvailableHours - committedHours);
    const roughNeeded = daysUntilDeadline * dailyHours * 0.5;
    const isWarning   = freeHours < roughNeeded;

    return {
      totalAvailableHours: Math.round(totalAvailableHours),
      committedHours:       Math.round(committedHours),
      freeHours:            Math.round(freeHours),
      roughNeeded:          Math.round(roughNeeded),
      isWarning,
      message: isWarning
        ? `You only have ~${Math.round(freeHours)}h free before the deadline but this project needs ~${Math.round(roughNeeded)}h`
        : `You have enough time — ${Math.round(freeHours)}h available`,
    };
  } catch (err) {
    console.error('Workload check error:', err.message);
    return { isWarning: false, message: '' };
  }
};