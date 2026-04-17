const { SlotPreference, WeeklyRoutine } = require('../../models/masss/Profile');
const User = require('../../models/User');

const ENERGY_DEFAULTS = {
  morning_bird: { morning: 0.85, afternoon: 0.55, evening: 0.30 },
  night_owl: { morning: 0.30, afternoon: 0.55, evening: 0.85 },
  balanced: { morning: 0.60, afternoon: 0.60, evening: 0.60 }
};

// Internal Helper mirroring Python _save_slots
const saveSlotsInternal = async (userId, slots, chronotype) => {
  await SlotPreference.deleteMany({ user_id: userId });
  const energyMap = ENERGY_DEFAULTS[chronotype] || ENERGY_DEFAULTS.balanced;

  const slotDocs = slots.map(slot => ({
    user_id: userId,
    slot_name: slot.slot_name,
    slot_label: slot.slot_label,
    start_time: slot.start_time,
    end_time: slot.end_time,
    max_pomodoros: slot.max_pomodoros,
    inferred_energy_score: energyMap[slot.slot_name] || 0.60,
    is_preferred: (energyMap[slot.slot_name] || 0.60) >= 0.75
  }));

  return await SlotPreference.insertMany(slotDocs);
};

// @route   POST /api/masss/onboarding/complete
exports.completeOnboarding = async (req, res) => {
  try {
    const { chronotype, routine_events, slots } = req.body;

    // 1. Save Slots
    await saveSlotsInternal(req.user.id, slots, chronotype);

    // 2. Clear and Save Routine
    await WeeklyRoutine.deleteMany({ user_id: req.user.id });
    
    let routines = [];
    for (const event of routine_events) {
      for (const day of event.days) {
        routines.push({
          user_id: req.user.id,
          name: event.name,
          activity_type: event.activity_type,
          day_of_week: day,
          start_time: event.start_time,
          end_time: event.end_time
        });
      }
    }
    await WeeklyRoutine.insertMany(routines);

    // 3. Mark User Onboarding Complete
    await User.findByIdAndUpdate(req.user.id, { onboarding_completed: true });

    res.json({ success: true, message: "Onboarding completed successfully" });
  } catch (error) {
    res.status(422).json({ success: false, message: error.message });
  }
};