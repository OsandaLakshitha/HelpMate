const { MasssProfile } = require('../../models/masss')

// ── GET /profile/preferences ──────────────────────────────────────────────────
exports.getPreferences = async (req, res) => {
  try {
    const profile = await MasssProfile.findOrCreate(req.user.id)

    // Return in the same shape the frontend expects
    // Mirrors PreferenceResponse schema from profile.py
    const preferences = profile.slotPreferences.map((p) => ({
      id:                    String(p._id),
      user_id:               String(req.user.id),
      slot_name:             p.slotName,
      slot_label:            p.slotLabel || null,
      start_time:            p.startTime || null,
      end_time:              p.endTime   || null,
      max_pomodoros:         p.maxPomodoros,
      inferred_energy_score: p.inferredEnergyScore,
      is_preferred:          p.isPreferred,
    }))

    res.json({ success: true, data: preferences })
  } catch (error) {
    console.error('[MASSS] getPreferences error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}


// ── POST /profile/preferences ─────────────────────────────────────────────────
// Upserts a single slot preference — mirrors set_slot_preference()
exports.setPreference = async (req, res) => {
  try {
    const {
      slot_name,
      slot_label,
      start_time,
      end_time,
      max_pomodoros,
      is_preferred = false,
    } = req.body

    if (!['morning', 'afternoon', 'evening'].includes(slot_name)) {
      return res.status(400).json({
        success: false,
        message: 'slot_name must be morning, afternoon, or evening',
      })
    }

    const profile = await MasssProfile.findOrCreate(req.user.id)

    // Find existing slot preference or create new one
    const existingIdx = profile.slotPreferences.findIndex(
      (p) => p.slotName === slot_name,
    )

    if (existingIdx >= 0) {
      // Update existing
      const pref = profile.slotPreferences[existingIdx]
      if (slot_label    !== undefined) pref.slotLabel    = slot_label
      if (start_time    !== undefined) pref.startTime    = start_time
      if (end_time      !== undefined) pref.endTime      = end_time
      if (max_pomodoros !== undefined) pref.maxPomodoros = max_pomodoros
      pref.isPreferred = is_preferred
    } else {
      // Push new
      profile.slotPreferences.push({
        slotName:            slot_name,
        slotLabel:           slot_label   || null,
        startTime:           start_time   || null,
        endTime:             end_time     || null,
        maxPomodoros:        max_pomodoros || 4,
        inferredEnergyScore: 0.5,
        isPreferred:         is_preferred,
      })
    }

    await profile.save()

    const updated = profile.slotPreferences.find((p) => p.slotName === slot_name)

    res.json({
      success: true,
      data: {
        id:                    String(updated._id),
        user_id:               String(req.user.id),
        slot_name:             updated.slotName,
        slot_label:            updated.slotLabel,
        start_time:            updated.startTime,
        end_time:              updated.endTime,
        max_pomodoros:         updated.maxPomodoros,
        inferred_energy_score: updated.inferredEnergyScore,
        is_preferred:          updated.isPreferred,
      },
    })
  } catch (error) {
    console.error('[MASSS] setPreference error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /profile/routine ──────────────────────────────────────────────────────
exports.getRoutine = async (req, res) => {
  try {
    const profile = await MasssProfile.findOrCreate(req.user.id)

    const routine = profile.weeklyRoutine.map((e) => ({
      id:            String(e._id),
      user_id:       String(req.user.id),
      name:          e.name,
      activity_type: e.activityType,
      day_of_week:   e.dayOfWeek,
      start_time:    e.startTime,
      end_time:      e.endTime,
    }))

    res.json({ success: true, data: routine })
  } catch (error) {
    console.error('[MASSS] getRoutine error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── POST /profile/routine ─────────────────────────────────────────────────────
// Adds routine events — one entry per day (same as profile.py add_routine_event)
exports.addRoutineEvent = async (req, res) => {
  try {
    const {
      name,
      activity_type,
      days,
      start_time,
      end_time,
    } = req.body

    if (!name || !activity_type || !Array.isArray(days) || !days.length) {
      return res.status(400).json({
        success: false,
        message: 'name, activity_type, and days (array) are required',
      })
    }

    const VALID_DAYS       = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
    const VALID_ACTIVITIES = ['class','sleep','habit','work']

    if (!VALID_ACTIVITIES.includes(activity_type)) {
      return res.status(400).json({
        success: false,
        message: `activity_type must be one of: ${VALID_ACTIVITIES.join(', ')}`,
      })
    }

    const invalidDays = days.filter((d) => !VALID_DAYS.includes(d))
    if (invalidDays.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid days: ${invalidDays.join(', ')}`,
      })
    }

    const profile = await MasssProfile.findOrCreate(req.user.id)

    // One entry per day — mirrors profile.py add_routine_event loop
    const created = []
    for (const day of days) {
      profile.weeklyRoutine.push({
        name,
        activityType: activity_type,
        dayOfWeek:    day,
        startTime:    start_time || '09:00',
        endTime:      end_time   || '10:00',
      })
      const newEntry = profile.weeklyRoutine[profile.weeklyRoutine.length - 1]
      created.push({
        id:            String(newEntry._id),
        user_id:       String(req.user.id),
        name:          newEntry.name,
        activity_type: newEntry.activityType,
        day_of_week:   newEntry.dayOfWeek,
        start_time:    newEntry.startTime,
        end_time:      newEntry.endTime,
      })
    }

    await profile.save()
    res.status(201).json({ success: true, data: created })
  } catch (error) {
    console.error('[MASSS] addRoutineEvent error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── DELETE /profile/routine/:eventId ─────────────────────────────────────────
exports.deleteRoutineEvent = async (req, res) => {
  try {
    const { eventId } = req.params

    const profile = await MasssProfile.findOrCreate(req.user.id)

    const eventIdx = profile.weeklyRoutine.findIndex(
      (e) => String(e._id) === eventId,
    )

    if (eventIdx === -1) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    profile.weeklyRoutine.splice(eventIdx, 1)
    await profile.save()

    res.json({ success: true, message: 'Event removed' })
  } catch (error) {
    console.error('[MASSS] deleteRoutineEvent error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── PUT /profile/routine/:eventId ─────────────────────────────────────────────
exports.updateRoutineEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const { name, activity_type, start_time, end_time } = req.body

    const profile  = await MasssProfile.findOrCreate(req.user.id)
    const event    = profile.weeklyRoutine.id(eventId)

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    if (name)          event.name         = name
    if (activity_type) event.activityType = activity_type
    if (start_time)    event.startTime    = start_time
    if (end_time)      event.endTime      = end_time

    await profile.save()

    res.json({
      success: true,
      data: {
        id:            String(event._id),
        user_id:       String(req.user.id),
        name:          event.name,
        activity_type: event.activityType,
        day_of_week:   event.dayOfWeek,
        start_time:    event.startTime,
        end_time:      event.endTime,
      },
    })
  } catch (error) {
    console.error('[MASSS] updateRoutineEvent error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}