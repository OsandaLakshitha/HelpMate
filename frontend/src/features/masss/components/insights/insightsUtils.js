// frontend/src/features/masss/components/insights/insightsUtils.js
// Pure functions only — no React, no JSX

export const SLOTS = ['morning', 'afternoon', 'evening']

export const energyBarPct = (s) => `${Math.max(0, ((s - 1) / 4) * 100)}%`
export const energyColour = (s) => s >= 4 ? '#0FA89E' : s >= 2.5 ? '#F59E0B' : '#EF4444'
export const fatColour    = (f) => f > 0.7 ? '#EF4444' : f > 0.4 ? '#F59E0B' : '#0FA89E'

export const fatigueMeta = (f) => {
  if (f > 0.7) return { label: 'Burnt Out', colour: '#EF4444', emoji: '😓',
    action: 'The AI is avoiding your hardest tasks and favouring shorter, lighter sessions.' }
  if (f > 0.4) return { label: 'Tiring', colour: '#F59E0B', emoji: '😐',
    action: 'The AI is mixing easier tasks in to protect your energy reserves.' }
  return { label: 'Fresh', colour: '#0FA89E', emoji: '😊',
    action: 'The AI is scheduling your most demanding tasks while your focus is peaking.' }
}

export const intensityMeta = (v) => {
  if (v > 0.8) return { label: 'Crunch Mode', colour: '#EF4444', emoji: '🔥',
    tip: 'Deadlines are imminent. The AI is pushing your most critical tasks to the top.' }
  if (v > 0.5) return { label: 'Moderate', colour: '#F59E0B', emoji: '⚡',
    tip: "A healthy workload. Stick to the schedule and you'll stay on top." }
  return { label: 'Manageable', colour: '#0FA89E', emoji: '✅',
    tip: 'Light workload. A great time to chip away at longer-term tasks.' }
}

export const slotHint = (score, fatVal) => {
  if (fatVal == null) return 'No session history yet for this slot.'
  if (fatVal > 0.7)   return 'Burnt out — the AI is reducing tasks here.'
  if (score >= 4)     return 'Your strongest slot. Hard tasks go here.'
  if (score >= 2.5)   return 'Decent energy. Good for medium-difficulty work.'
  return 'Lower energy — the AI assigns lighter tasks here.'
}

export const taskReason = (scheduledTask, fullTask, bestSlot) => {
  if (!fullTask) return null
  if (fullTask.status === 'in_progress')
    return { icon: '▶', colour: '#6366F1', text: 'Already started — AI kept your momentum going' }
  if (scheduledTask.allocation_type === 'sticky_rule')
    return { icon: '📌', colour: '#6366F1', text: 'In progress — pinned to keep your momentum' }
  if (fullTask.deadline) {
    const days = Math.ceil((new Date(fullTask.deadline) - new Date()) / 86400000)
    if (days <= 1) return { icon: '🚨', colour: '#EF4444', text: 'Due tomorrow — top priority right now' }
    if (days <= 3) return { icon: '⏰', colour: '#EF4444', text: `Due in ${days} days — urgent` }
    if (days <= 7) return { icon: '📅', colour: '#F59E0B', text: `Due in ${days} days — scheduled before it gets critical` }
  }
  if (scheduledTask.slot === bestSlot)
    return { icon: '⚡', colour: '#0FA89E', text: 'Placed in your highest-energy slot' }
  if (fullTask.difficulty >= 4)
    return { icon: '🧠', colour: '#0FA89E', text: "Hard task — scheduled when you're at your best" }
  if (fullTask.priority === 'high')
    return { icon: '🔺', colour: '#F59E0B', text: 'High priority — AI ranked this near the top' }
  return { icon: '📋', colour: '#94A3B8', text: 'Fits your available capacity for this slot' }
}

export const build28DayData = (sessions) => {
  const today = new Date()
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (27 - i))
    return d.toISOString().slice(0, 10)
  })
  const byDate = {}
  sessions.forEach(s => {
    const rating = s.focusRating ?? s.focus_rating
    if (!rating) return
    const date = (s.startTime || s.start_time || '').slice(0, 10)
    if (!date || !days.includes(date)) return
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(rating)
  })
  return days.map(date => ({
    date,
    avg: byDate[date] ? byDate[date].reduce((a, b) => a + b, 0) / byDate[date].length : null,
    count: byDate[date]?.length ?? 0,
  }))
}