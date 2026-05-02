// ═══════════════════════════════════════════════════════════════════════════
// services/Bservices/dailyRefresh.js
//
// Midnight cron job — runs recalculate() for every student in every open project.
//
// WHY THIS IS NEEDED:
//   Students who don't complete tasks on a given day still need their
//   BDailyLog record written for that day. Without this:
//     → resilienceScore has gaps (missing days look like no-activity)
//     → studentRatio weighted average becomes inaccurate over time
//     → danger-recoverable status may not trigger correctly next morning
//
// DAILY TARGET NOTE:
//   dailyTarget is 100% system generated — no student input.
//   Formula: ceil(pendingTasks / daysLeft × loadFactor)
// ═══════════════════════════════════════════════════════════════════════════

const cron = require('node-cron');

// Dynamic imports — your other Bservices files use ES module syntax
const getRecalculate = async () => {
  const { recalculate } = await import('./Predictionengine.js');
  return recalculate;
};

const getBProject = async () => {
  const mod = await import('../../models/Bmodels/BProject.js');
  return mod.default;
};

// Runs every day at midnight 00:00
cron.schedule('0 0 * * *', async () => {
  const startTime = new Date();
  console.log(`[dailyRefresh] Started at ${startTime.toISOString()}`);

  try {
    const BProject    = await getBProject();
    const recalculate = await getRecalculate();

    // Only open projects with a future due date
    const projects = await BProject.find({
      status:  'Open',
      dueDate: { $gt: new Date() },
    }).lean();

    let successCount = 0;
    let failCount    = 0;

    for (const project of projects) {
      for (const studentId of project.memberIds) {
        try {
          await recalculate({
            studentId,
            projectId:   project._id,
            triggerType: 'daily-refresh',
          });
          successCount++;
        } catch (err) {
          failCount++;
          console.error(
            `[dailyRefresh] Failed — student: ${studentId} project: ${project._id} — ${err.message}`
          );
        }
      }
    }

    const duration = ((new Date() - startTime) / 1000).toFixed(1);
    console.log(
      `[dailyRefresh] Done in ${duration}s — ${successCount} success, ${failCount} failed`
    );

  } catch (err) {
    console.error('[dailyRefresh] Fatal error:', err.message);
  }
});