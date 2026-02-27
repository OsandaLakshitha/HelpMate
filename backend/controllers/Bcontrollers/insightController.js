import BInteractionLog from '../../models/Bmodels/BInteractionLog.js';
import BTask from '../../models/Bmodels/BTask.js';
import { computeContributionPercent, detectFreeRiders } from '../../utils/performance.js';
import { formatDuration } from '../../utils/time.js';

export async function getUserInsights(req, res) {
  try {
    const userId = req.params.userId;
    console.log(`[Insight] Fetching insights for user: ${userId}`);

    // Interaction frequency per project
    const freq = await BInteractionLog.aggregate([
      { $match: { userId } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } }
    ]);

    // Last active date
    const lastActive = await BInteractionLog.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    // Action distribution
    const actions = await BInteractionLog.aggregate([
      { $match: { userId } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // Task stats - include both assigned tasks and tasks created by the user
    const [assignedTasks, createdTasks] = await Promise.all([
      BTask.find({ assigneeId: userId }),
      BTask.find({ createdBy: userId, assigneeId: { $ne: userId } }) // Tasks created by but not assigned to user
    ]);
    
    const allTasks = [...new Set([...assignedTasks, ...createdTasks])]; // Remove duplicates if any
    
    // Get all tasks created by the user
    const createdTasksAll = await BTask.find({ createdBy: userId });
    
    const taskStats = {
      total: allTasks.length,
      assigned: assignedTasks.length,
      created: createdTasks.length,
      completed: allTasks.filter(t => t.status === 'Completed').length,
      inProgress: allTasks.filter(t => t.status === 'In Progress').length,
      toBeReviewed: allTasks.filter(t => t.status === 'To Be Reviewed').length,
      new: allTasks.filter(t => t.status === 'New').length
    };
    
    // Task status counts for tasks created by the user
    const createdTasksStats = {
      total: createdTasksAll.length,
      completed: createdTasksAll.filter(t => t.status === 'Completed').length,
      inProgress: createdTasksAll.filter(t => t.status === 'In Progress').length,
      toBeReviewed: createdTasksAll.filter(t => t.status === 'To Be Reviewed').length,
      new: createdTasksAll.filter(t => t.status === 'New').length
    };

    console.log('Created Tasks Stats:', createdTasksStats);
    console.log('Found created tasks:', createdTasksAll.length);
    console.log('Created tasks sample:', createdTasksAll.slice(0, 2));

    // Contribution + free riding detection - using created tasks for now
    const members = createdTasksAll.map(t => ({
      contributionTotal: (t.proofFiles?.length || 0) + (t.proofCommits?.length || 0),
      activeTimeMinutes: 0 // can later be enriched with interaction counts
    }));
    
    let contributions = [];
    let freeRiders = [];
    
    if (members.length > 0) {
      contributions = computeContributionPercent(members);
      freeRiders = detectFreeRiders(contributions);
    }

    res.json({
      userId,
      interactionFrequency: freq,
      lastActive,
      actionDistribution: actions,
      taskStats,
      createdTasks: createdTasksStats, // Changed to match frontend expectation
      contributions,
      freeRiders,
      lastActiveFormatted: lastActive ? formatDuration(Date.now() - lastActive.createdAt) : '—'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute insights' });
  }
}
