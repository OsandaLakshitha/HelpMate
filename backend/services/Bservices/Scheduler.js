import cron from 'node-cron';
import BTask from '../../models/Bmodels/BTask.js';
//import { recalculate } from './backend/services/Bservices/Predictionengine.js';
import { recalculate } from './Predictionengine.js';

// Runs every night at midnight.
// Finds tasks past dueDate + 12hrs that are still New.
// Marks them overdue and recalculates predictions.
export const startScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running nightly overdue task check...');
    try {
      const now     = new Date();
      const cutoff  = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      const overdueTasks = await BTask.find({ status: 'New', dueDate: { $lt: cutoff } });

      for (const task of overdueTasks) {
        if (task.completionState !== 'overdue') {
          task.completionState = 'overdue';
          await task.save();
        }
      }

      // One recalculate per student per project
      const pairs = new Map();
      for (const task of overdueTasks) {
        const key = `${task.projectId}_${task.assigneeId}`;
        if (!pairs.has(key)) pairs.set(key, { projectId: task.projectId, studentId: task.assigneeId });
      }

      let updated = 0;
      for (const { projectId, studentId } of pairs.values()) {
        await recalculate({ studentId, projectId, triggerType: 'task-overdue' });
        updated++;
      }

      console.log(`✅ Overdue check done — ${overdueTasks.length} tasks, ${updated} predictions updated`);
    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  });

  console.log('📅 Scheduler started — runs daily at midnight');
};