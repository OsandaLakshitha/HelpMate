const PomodoroSession = require('../../models/masss/Session');
const Task = require('../../models/masss/Task');
const { SlotPreference } = require('../../models/masss/Profile');

// Helper mirroring get_slot_for_user
const getAutoSlot = async (userId) => {
  const now = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  
  const prefs = await SlotPreference.find({ user_id: userId });
  
  for (const pref of prefs) {
    if (pref.start_time && pref.end_time) {
      const [sh, sm] = pref.start_time.split(':').map(Number);
      const [eh, em] = pref.end_time.split(':').map(Number);
      const startM = sh * 60 + sm;
      const endM = eh * 60 + em;
      
      if (startM <= currentMinutes && currentMinutes < endM) return pref.slot_name;
    }
  }
  return "afternoon"; // Fallback
};

// @route   POST /api/masss/sessions/start
exports.startSession = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.body.task_id, user_id: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Mark task IN_PROGRESS
    task.status = 'in_progress';
    await task.save();

    const slot = await getAutoSlot(req.user.id);

    const newSession = await PomodoroSession.create({
      task_id: req.body.task_id,
      user_id: req.user.id,
      slot_type: slot,
      is_completed: false
    });

    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   POST /api/masss/sessions/:id/end
exports.endSession = async (req, res) => {
  try {
    const { end_type, focus_rating } = req.body;
    const session = await PomodoroSession.findOne({ _id: req.params.id, user_id: req.user.id });
    
    if (!session || session.end_time) return res.status(400).json({ message: "Invalid session" });

    const endTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const duration = (endTime - session.start_time) / (1000 * 60);

    session.end_time = endTime;
    session.duration_minutes = Math.round(duration * 100) / 100;
    session.end_type = end_type;
    session.focus_rating = focus_rating;

    if (end_type === 'completed') {
      session.is_completed = true;
      await Task.findByIdAndUpdate(session.task_id, { $inc: { sessions_count: 1 } });
    }

    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};