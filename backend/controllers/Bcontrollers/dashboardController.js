import BTask from '../../models/Bmodels/BTask.js';
import BProject from '../../models/Bmodels/BProject.js';
import User from '../../models/User.js'; 
import { Types } from 'mongoose';

// @route   GET /api/user/dashboard-summary
// @desc    Get counts and task list for the main dashboard
export async function getDashboardSummary(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User not authenticated'
    });
  }

  try {
    const userId = new Types.ObjectId(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Fetch User details (to fix missing name)
    const dbUser = await User.findById(userId).select('firstName lastName name');
    const displayName = dbUser 
      ? (dbUser.firstName || dbUser.name || 'User') 
      : 'User';

    // 2. Fetch Stats & Upcoming Tasks
    const [openProjectsCount, newTasksCount, inProgressTasksCount, upcomingTasks] = await Promise.all([
      BProject.countDocuments({
        memberIds: userId,
        status: 'Open'
      }),
      BTask.countDocuments({
        assigneeId: userId,
        status: 'New'
      }),
      BTask.countDocuments({
        assigneeId: userId,
        status: 'In Progress'
      }),
      BTask.find({
        assigneeId: userId,
        dueDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        status: { $in: ['New', 'In Progress'] }
      }).sort({ dueDate: 1 }).limit(10).lean()
    ]);

    // 3. Fetch Active Tasks with the EXACT collection name 'BProject'
    const activeTasks = await BTask.aggregate([
      {
        $match: {
          assigneeId: userId,
          status: { $in: ['New', 'In Progress'] }
        }
      },
      {
        $lookup: {
          from: 'BProject', // <--- FIXED: Matches your model's collection: 'BProject'
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectData'
        }
      },
      { $unwind: { path: '$projectData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          description: 1,
          status: 1,
          dueDate: 1,
          priority: 1,
          // FIXED: Use $projectData.title based on your schema
          projectTitle: { $ifNull: ['$projectData.title', 'No Project Assigned'] },
          projectColor: { $ifNull: ['$projectData.color', '#3b82f6'] } 
        }
      },
      { $sort: { status: -1, dueDate: 1 } },
      { $limit: 15 }
    ]);

    // 4. Calendar Logic (Event Counting)
    const calendarTasks = await BTask.aggregate([
      {
        $match: {
          assigneeId: userId,
          dueDate: { $exists: true, $ne: null },
          status: { $in: ['New', 'In Progress'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dueDate' } },
          count: { $sum: 1 }
        }
      }
    ]);

    const calendarEvents = {};
    calendarTasks.forEach(task => {
      if (task._id) calendarEvents[task._id] = task.count;
    });

    // 5. Final Response
    res.status(200).json({
      success: true,
      user: {
        name: displayName,
        greeting: getGreeting()
      },
      stats: {
        newTasks: newTasksCount,
        inProgressTasks: inProgressTasksCount,
        openProjects: openProjectsCount
      },
      tasks: activeTasks,
      upcomingTasks,
      calendar: {
        today: today.toISOString(),
        events: calendarEvents,
        todayTasks: await BTask.find({
          assigneeId: userId,
          dueDate: { $gte: today, $lt: tomorrow },
          status: { $in: ['New', 'In Progress'] }
        }).select('name').lean()
      }
    });

  } catch (error) {
    console.error('[Dashboard Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}