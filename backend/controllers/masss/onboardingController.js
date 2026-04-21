const { MasssProfile } = require('../../models/masss')
const {
  CHRONOTYPE_SLOT_DEFAULTS,
  ENERGY_DEFAULTS,
} = require('../../config/masssConstants')

// ── Helper: build slot preferences array ─────────────────────────────────────
// Mirrors _save_slots() in onboarding.py
const buildSlotPreferences = (slots, chronotype) => {
  const energyMap = ENERGY_DEFAULTS[chronotype] || ENERGY_DEFAULTS.balanced

  return slots.map((slot) => {
    const slotName = slot.slot_name || slot.slotName
    const energy   = energyMap[slotName] ?? 0.60

    return {
      slotName:            slotName,
      slotLabel:           slot.slot_label || slot.slotLabel || slotName,
      startTime:           slot.start_time || slot.startTime || null,
      endTime:             slot.end_time   || slot.endTime   || null,
      maxPomodoros:        slot.max_pomodoros || slot.maxPomodoros || 4,
      inferredEnergyScore: energy,
      isPreferred:         energy >= 0.75,
    }
  })
}

// ── Helper: build routine array ───────────────────────────────────────────────
// Mirrors the routine loop in complete_onboarding()
// The frontend sends days as an array — we create one entry per day
const buildRoutineEntries = (routineEvents) => {
  const entries = []
  const VALID_DAYS        = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  const VALID_ACTIVITIES  = ['class','sleep','habit','work']

  for (const event of routineEvents) {
    const activityType = event.activity_type || event.activityType || 'class'
    if (!VALID_ACTIVITIES.includes(activityType)) continue

    const days = event.days || []
    for (const day of days) {
      if (!VALID_DAYS.includes(day)) continue
      entries.push({
        name:         event.name,
        activityType: activityType,
        dayOfWeek:    day,
        startTime:    event.start_time || event.startTime || '09:00',
        endTime:      event.end_time   || event.endTime   || '10:00',
      })
    }
  }
  return entries
}

// ── GET /onboarding/status ────────────────────────────────────────────────────
exports.getStatus = async (req, res) => {
  try {
    const profile = await MasssProfile.findOrCreate(req.user.id)

    res.json({
      success:              true,
      onboarding_completed: profile.onboardingCompleted,
      user_id:              req.user.id,
      // Helpmate has no username field — use email as identifier
      username:             req.user.firstName || req.user.email,
    })
  } catch (error) {
    console.error('[MASSS] getStatus error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /onboarding/slot-defaults/:chronotype ─────────────────────────────────
exports.getSlotDefaults = (req, res) => {
  const { chronotype } = req.params

  if (!CHRONOTYPE_SLOT_DEFAULTS[chronotype]) {
    return res.status(400).json({
      success: false,
      message: `Unknown chronotype: ${chronotype}. Must be morning_bird, night_owl, or balanced.`,
    })
  }

  res.json({
    success:    true,
    chronotype,
    slots:      CHRONOTYPE_SLOT_DEFAULTS[chronotype],
  })
}

// ── POST /onboarding/complete ─────────────────────────────────────────────────
exports.completeOnboarding = async (req, res) => {
  try {
    const { chronotype, routine_events = [], slots } = req.body

    // Validate chronotype
    if (!CHRONOTYPE_SLOT_DEFAULTS[chronotype]) {
      return res.status(422).json({
        success: false,
        message: `Invalid chronotype: ${chronotype}`,
      })
    }

    // Validate slots — must have exactly morning, afternoon, evening
    if (!slots || !Array.isArray(slots) || slots.length !== 3) {
      return res.status(422).json({
        success: false,
        message: 'Must provide exactly 3 slots: morning, afternoon, evening',
      })
    }

    const slotNames = slots.map((s) => s.slot_name || s.slotName)
    const required  = new Set(['morning', 'afternoon', 'evening'])
    const provided  = new Set(slotNames)
    const missing   = [...required].filter((s) => !provided.has(s))

    if (missing.length > 0) {
      return res.status(422).json({
        success: false,
        message: `Missing slots: ${missing.join(', ')}`,
      })
    }

    // Build data
    const slotPreferences = buildSlotPreferences(slots, chronotype)
    const weeklyRoutine   = buildRoutineEntries(routine_events)

    // Upsert profile
    await MasssProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          chronotype,
          slotPreferences,
          weeklyRoutine,
          onboardingCompleted: true,
        },
      },
      { upsert: true, new: true },
    )

    res.json({
      success:              true,
      message:              'Onboarding completed successfully',
      onboarding_completed: true,
    })
  } catch (error) {
    console.error('[MASSS] completeOnboarding error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── POST /onboarding/skip ─────────────────────────────────────────────────────
exports.skipOnboarding = async (req, res) => {
  try {
    const balancedSlots = buildSlotPreferences(
      CHRONOTYPE_SLOT_DEFAULTS.balanced,
      'balanced',
    )

    await MasssProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          chronotype:          'balanced',
          slotPreferences:     balancedSlots,
          onboardingCompleted: true,
        },
      },
      { upsert: true, new: true },
    )

    res.json({
      success:              true,
      message:              'Onboarding skipped',
      onboarding_completed: true,
    })
  } catch (error) {
    console.error('[MASSS] skipOnboarding error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}