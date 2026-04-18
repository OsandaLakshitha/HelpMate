/**
 * MASSS Constants
 * Shared across controllers — chronotype defaults, energy maps, etc.
 */

// ── Chronotype slot defaults ──────────────────────────────────────────────────
// Mirrors MASSS Python backend CHRONOTYPE_SLOT_DEFAULTS exactly.
// Used by onboarding controller.

const CHRONOTYPE_SLOT_DEFAULTS = {
  morning_bird: [
    {
      slotName:     'morning',
      slotLabel:    'Morning Focus',
      startTime:    '07:00',
      endTime:      '12:00',
      maxPomodoros: 6,
    },
    {
      slotName:     'afternoon',
      slotLabel:    'Afternoon',
      startTime:    '13:00',
      endTime:      '17:00',
      maxPomodoros: 3,
    },
    {
      slotName:     'evening',
      slotLabel:    'Wind Down',
      startTime:    '18:00',
      endTime:      '21:00',
      maxPomodoros: 1,
    },
  ],
  night_owl: [
    {
      slotName:     'morning',
      slotLabel:    'Morning',
      startTime:    '09:00',
      endTime:      '12:00',
      maxPomodoros: 1,
    },
    {
      slotName:     'afternoon',
      slotLabel:    'Afternoon',
      startTime:    '13:00',
      endTime:      '17:00',
      maxPomodoros: 3,
    },
    {
      slotName:     'evening',
      slotLabel:    'Night Grind',
      startTime:    '20:00',
      endTime:      '23:30',
      maxPomodoros: 6,
    },
  ],
  balanced: [
    {
      slotName:     'morning',
      slotLabel:    'Morning',
      startTime:    '08:00',
      endTime:      '12:00',
      maxPomodoros: 4,
    },
    {
      slotName:     'afternoon',
      slotLabel:    'Afternoon',
      startTime:    '13:00',
      endTime:      '17:00',
      maxPomodoros: 4,
    },
    {
      slotName:     'evening',
      slotLabel:    'Evening',
      startTime:    '19:00',
      endTime:      '22:00',
      maxPomodoros: 4,
    },
  ],
}

// ── Energy defaults per chronotype per slot ───────────────────────────────────
const ENERGY_DEFAULTS = {
  morning_bird: { morning: 0.85, afternoon: 0.55, evening: 0.30 },
  night_owl:    { morning: 0.30, afternoon: 0.55, evening: 0.85 },
  balanced:     { morning: 0.60, afternoon: 0.60, evening: 0.60 },
}

// ── Slot detection helper ─────────────────────────────────────────────────────
// Detects which slot the current time falls into based on user's preferences.
// Called by sessionController when starting a session.

const getSlotForTime = (slotPreferences, date = new Date()) => {
  const currentMinutes = date.getHours() * 60 + date.getMinutes()

  if (slotPreferences && slotPreferences.length > 0) {
    // First pass: exact match inside a configured window
    for (const pref of slotPreferences) {
      if (!pref.startTime || !pref.endTime) continue

      const [sh, sm] = pref.startTime.split(':').map(Number)
      const [eh, em] = pref.endTime.split(':').map(Number)
      const start = sh * 60 + sm
      const end   = eh * 60 + em

      if (start <= end) {
        if (currentMinutes >= start && currentMinutes < end)
          return pref.slotName
      } else {
        // Overnight slot
        if (currentMinutes >= start || currentMinutes < end)
          return pref.slotName
      }
    }

    // Second pass: no exact match — return nearest upcoming slot
    let nearest = null
    let nearestDistance = Infinity
    for (const pref of slotPreferences) {
      if (!pref.startTime) continue
      const [sh, sm] = pref.startTime.split(':').map(Number)
      const start = sh * 60 + sm
      const distance = (start - currentMinutes + 1440) % 1440
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = pref
      }
    }
    if (nearest) return nearest.slotName
  }

  // Legacy fallback
  const h = date.getHours()
  if (h >= 6  && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'evening'
}

module.exports = {
  CHRONOTYPE_SLOT_DEFAULTS,
  ENERGY_DEFAULTS,
  getSlotForTime,
}