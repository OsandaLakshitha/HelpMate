// frontend/src/features/masss/utils/slotUtils.js

/**
 * Helpers for slot detection and slot display.
 */

// Detect current slot from time + user preferences
export const getCurrentSlot = (slotPreferences = []) => {
  const now     = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()

  if (slotPreferences.length > 0) {
    // First pass: exact match
    for (const pref of slotPreferences) {
      if (!pref.start_time || !pref.end_time) continue
      const [sh, sm] = pref.start_time.split(':').map(Number)
      const [eh, em] = pref.end_time.split(':').map(Number)
      const start    = sh * 60 + sm
      const end      = eh * 60 + em

      if (start <= end) {
        if (minutes >= start && minutes < end) return pref.slot_name
      } else {
        // Overnight slot
        if (minutes >= start || minutes < end) return pref.slot_name
      }
    }

    // Second pass: nearest upcoming
    let nearest = null
    let nearestDist = Infinity
    for (const pref of slotPreferences) {
      if (!pref.start_time) continue
      const [sh, sm] = pref.start_time.split(':').map(Number)
      const start    = sh * 60 + sm
      const dist     = (start - minutes + 1440) % 1440
      if (dist < nearestDist) {
        nearestDist = dist
        nearest     = pref
      }
    }
    if (nearest) return nearest.slot_name
  }

  // Legacy fallback
  const h = now.getHours()
  if (h >= 6  && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'evening'
}

// Slot display colour
export const slotColour = (slot) => ({
  morning:   '#FBBF24',
  afternoon: '#38BDF8',
  evening:   '#818CF8',
}[slot] || '#94A3B8')

// Slot icon name (for display)
export const slotEmoji = (slot) => ({
  morning:   '🌅',
  afternoon: '☀️',
  evening:   '🌙',
}[slot] || '📚')

// Slot display label (fallback if no custom label)
export const slotDefaultLabel = (slot) => ({
  morning:   'Morning',
  afternoon: 'Afternoon',
  evening:   'Evening',
}[slot] || slot)

// Get slot label from user preferences
export const getSlotLabel = (slot, slotPreferences = []) => {
  const pref = slotPreferences.find(p => p.slot_name === slot)
  return pref?.slot_label || slotDefaultLabel(slot)
}

// Fatigue label and colour
export const fatigueLabel = (fatigue) => {
  if (fatigue < 0.40) return { label: 'FRESH',        colour: '#34D399' }
  if (fatigue < 0.70) return { label: 'FATIGUING',    colour: '#FBBF24' }
  return                     { label: 'BURNOUT RISK', colour: '#F87171' }
}