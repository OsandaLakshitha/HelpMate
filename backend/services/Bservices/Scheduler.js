// services/Bservices/scheduler.js
import cron from 'node-cron';
import BProject from '../../models/Bmodels/BProject.js';
import { recalculateAllForStudent } from './Predictionengine.js';

export function startScheduler() {
  // Run at 00:01 every day
  cron.schedule('1 0 * * *', async () => {
    console.log('⏰ Daily prediction refresh starting...');
    const startTime = Date.now();

    try {
      const now = new Date();

      // Find all open projects with future deadlines
      const activeProjects = await BProject.find({
        status: 'Open',
        dueDate: { $gt: now },
      }).lean();

      // Collect unique student IDs from all projects
      const studentSet = new Set();
      for (const project of activeProjects) {
        for (const memberId of project.memberIds || []) {
          studentSet.add(String(memberId));
        }
      }

      // Recalculate all projects for each student
      let refreshed = 0;
      let failed = 0;

      for (const studentId of studentSet) {
        try {
          await recalculateAllForStudent(studentId, 'daily-refresh');
          refreshed++;
        } catch (err) {
          console.error(`Refresh failed: student=${studentId}`, err.message);
          failed++;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Daily refresh done in ${duration}s. Refreshed: ${refreshed}, Failed: ${failed}`);

    } catch (err) {
      console.error('❌ Scheduler error:', err.message);
    }
  });

  console.log('⏰ Prediction scheduler running — refreshes daily at 00:01');
}