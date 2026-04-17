const PomodoroSession = require('../../models/masss/Session');
const Task = require('../../models/masss/Task');

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Last 7 Focus Ratings
    const recentSessions = await PomodoroSession.find({ user_id: userId })
      .sort({ start_time: -1 })
      .limit(7);
    
    const recentRatings = recentSessions.map(s => s.focus_rating || 3.0).reverse();

    // 2. Streak Logic (simplified for Mongoose)
    // In a real production app, you'd aggregate this, 
    // but here is the direct parity version:
    const sessionsToday = await PomodoroSession.countDocuments({
      user_id: userId,
      is_completed: true,
      start_time: { $gte: new Date().setHours(0,0,0,0) }
    });

    res.json({
      success: true,
      data: {
        recent_ratings: recentRatings,
        sessions_today: sessionsToday,
        streak_days: sessionsToday > 0 ? 1 : 0, // Simplified streak logic
        recent_avg_focus: recentRatings.length ? (recentRatings.reduce((a,b) => a+b, 0) / recentRatings.length) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};