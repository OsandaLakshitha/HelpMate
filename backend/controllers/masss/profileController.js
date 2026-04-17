const { WeeklyRoutine, SlotPreference } = require('../../models/masss/Profile');

// --- ROUTINE MANAGEMENT ---

// @route   POST /api/masss/profile/routine
exports.addRoutineEvent = async (req, res) => {
  try {
    const { name, activity_type, days, start_time, end_time } = req.body;
    
    // Mirrors the 'for day in payload.days' logic in Python
    const events = days.map(day => ({
      user_id: req.user.id,
      name,
      activity_type,
      day_of_week: day,
      start_time,
      end_time
    }));

    const createdEvents = await WeeklyRoutine.insertMany(events);
    res.status(201).json({ success: true, data: createdEvents });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- PREFERENCE MANAGEMENT ---

// @route   POST /api/masss/profile/preferences
exports.setSlotPreference = async (req, res) => {
  try {
    const { slot_name, max_pomodoros, is_preferred } = req.body;
    
    // Mirrors the filter/first logic to update or create
    let pref = await SlotPreference.findOne({ user_id: req.user.id, slot_name });

    if (pref) {
      pref.max_pomodoros = max_pomodoros;
      pref.is_preferred = is_preferred;
      await pref.save();
    } else {
      pref = await SlotPreference.create({
        user_id: req.user.id,
        slot_name,
        max_pomodoros,
        is_preferred
      });
    }

    res.json({ success: true, data: pref });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};