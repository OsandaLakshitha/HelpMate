/**
 * rlClient.js
 * -----------
 * Node.js port of rl_client.py
 * Builds request bodies from MongoDB and forwards to the RL microservice.
 * Called by statsController (state vector) and statsController (schedule).
 */

const axios = require('axios')
const { MasssTask, MasssSession, MasssProfile, MasssModule } = require('../../models/masss')
const { RL_BASE_URL, RL_SERVICE_KEY } = require('../../config/masssMode')

const RL_TIMEOUT = 30_000  // 30 seconds in ms
const RL_HEADERS = {
  'Content-Type': 'application/json',
  'X-Service-Key': RL_SERVICE_KEY,
}

// ── Default hour helpers ──────────────────────────────────────────────────────
const defaultStart = (slotName) =>
  ({ morning: 6.0, afternoon: 12.0, evening: 18.0 }[slotName] ?? 8.0)

const defaultEnd = (slotName) =>
  ({ morning: 12.0, afternoon: 18.0, evening: 24.0 }[slotName] ?? 22.0)

// ── Parse "HH:MM" → decimal hour ─────────────────────────────────────────────
const timeToHour = (timeStr) => {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

const fetchTasks = async (userId) => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 0) // today

  const tasks = await MasssTask.find({
    userId,
    status: { $in: ['pending', 'in_progress'] },
  }).populate('moduleId', 'category name')
    .populate('examId', 'dueDate')
    .lean()

  return tasks.map((task) => {
    // Calculate days until deadline
    let daysUntil = null
    if (task.deadline) {
      daysUntil = Math.floor((new Date(task.deadline) - new Date()) / 86_400_000)
    } else if (task.examId?.dueDate) {
      daysUntil = Math.floor((new Date(task.examId.dueDate) - new Date()) / 86_400_000)
    }

    return {
      id:                   String(task._id),
      name:                 task.name,
      priority:             task.priority,           // already lowercase
      difficulty:           task.difficulty || 3,
      category:             task.moduleId?.category || 'other', // already lowercase
      estimated_pomodoros:  task.estimatedPomodoros || 1,
      sessions_count:       task.sessionsCount || 0,
      days_until:           daysUntil,
      status:               task.status,             // already lowercase
    }
  })
}

const fetchSessionHistory = async (userId) => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)

  const sessions = await MasssSession.find({
    userId,
    startTime: { $gte: cutoff },
  })
    .sort({ startTime: -1 })
    .limit(50)
    .lean()

  return sessions.map((s) => ({
    focus_rating:     s.focusRating ? parseFloat(s.focusRating) : null,
    end_type:         (s.endType || 'aborted').toLowerCase(),
    slot_type:        (s.slotType || 'morning').toLowerCase(),
    duration_minutes: parseFloat(s.durationMinutes || 0),
    started_at:       s.startTime ? new Date(s.startTime).toISOString() : '',
  }))
}

const fetchSlotPreferences = async (userId) => {
  const profile = await MasssProfile.findOne({ userId }).lean()
  const prefs   = profile?.slotPreferences || []

  if (!prefs.length) {
    // Default fallback — mirrors rl_client.py fallback
    return [
      { slot_name: 'morning',   slot_label: 'Morning',   start_hour: 6,  end_hour: 12, max_pomodoros: 4 },
      { slot_name: 'afternoon', slot_label: 'Afternoon', start_hour: 12, end_hour: 18, max_pomodoros: 4 },
      { slot_name: 'evening',   slot_label: 'Evening',   start_hour: 18, end_hour: 24, max_pomodoros: 4 },
    ]
  }

  return prefs.map((p) => ({
    slot_name:     p.slotName,
    slot_label:    p.slotLabel || p.slotName,
    start_hour:    p.startTime ? timeToHour(p.startTime) : defaultStart(p.slotName),
    end_hour:      p.endTime   ? timeToHour(p.endTime)   : defaultEnd(p.slotName),
    max_pomodoros: p.maxPomodoros || 4,
  }))
}

const fetchWeeklyRoutine = async (userId) => {
  const profile = await MasssProfile.findOne({ userId }).lean()
  const routine = profile?.weeklyRoutine || []

  return routine.map((e) => ({
    name:          e.name,
    activity_type: e.activityType,
    day_of_week:   e.dayOfWeek,
    start_time:    e.startTime || '00:00',
    end_time:      e.endTime   || '00:00',
  }))
}

const buildRequestBody = async (userId, activeSlot = 'morning', includeTasks = true) => {
  const [sessionHistory, slotPreferences, weeklyRoutine] = await Promise.all([
    fetchSessionHistory(userId),
    fetchSlotPreferences(userId),
    fetchWeeklyRoutine(userId),
  ])

  const body = {
    user_id:         String(userId),
    active_slot:     activeSlot,
    session_history: sessionHistory,
    slot_preferences: slotPreferences,
    weekly_routine:  weeklyRoutine,
  }

  if (includeTasks) {
    body.tasks = await fetchTasks(userId)
  }

  return body
}



// ── Past-slot zeroing ─────────────────────────────────────────────────────────
const getPastSlotCapacities = (slotPreferences, activeSlot) => {
  const nowHour = new Date().getHours() + new Date().getMinutes() / 60
  const zeroed = {}
  for (const pref of slotPreferences) {
if (pref.slot_name === activeSlot && pref.start_hour <= nowHour) continue
    if (pref.end_hour < nowHour - 0.5) {
      zeroed[pref.slot_name] = true
    }
  }
  return zeroed
}

// ── Sticky rule with capacity cap ─────────────────────────────────────────────
const applyCapacityLimits = (schedule, slotPreferences, pastSlots) => {
  const capacityMap = {}
  for (const pref of slotPreferences) {
    capacityMap[pref.slot_name] = pastSlots[pref.slot_name] ? 0 : pref.max_pomodoros
  }

  const result = { morning: [], afternoon: [], evening: [] }
  for (const slot of ['morning', 'afternoon', 'evening']) {
    const tasks = schedule[slot] ?? []
    let used = 0
    for (const task of tasks) {
      if (used >= capacityMap[slot]) break
      result[slot].push(task)
      used++
    }
  }
  return result
}

// ── Public functions ──────────────────────────────────────────────────────────

const getRLSchedule = async (userId, activeSlot = 'morning') => {
  const body = await buildRequestBody(userId, activeSlot, true)

  try {
const response = await axios.post(
  `${RL_BASE_URL}/schedule`,
  body,
  { headers: RL_HEADERS, timeout: RL_TIMEOUT },
)

const pastSlots = getPastSlotCapacities(body.slot_preferences, activeSlot)
const cleaned   = applyCapacityLimits(response.data, body.slot_preferences, pastSlots)

return {
  ...response.data,
  morning:   cleaned.morning,
  afternoon: cleaned.afternoon,
  evening:   cleaned.evening,
}
  } catch (err) {
    const reason = err.code === 'ECONNREFUSED'
      ? 'RL service unavailable'
      : err.code === 'ECONNABORTED'
      ? 'RL service timeout'
      : `RL service error: ${err.response?.status || err.message}`

    return {
      morning:        [],
      afternoon:      [],
      evening:        [],
      strategy_used:  'unavailable',
      work_intensity: 0.0,
      error:          reason,
    }
  }
}

const getRLState = async (userId, activeSlot = 'morning') => {
  const body = await buildRequestBody(userId, activeSlot, false)

  try {
    const response = await axios.post(
      `${RL_BASE_URL}/state`,
      body,
      { headers: RL_HEADERS, timeout: RL_TIMEOUT },
    )
    return response.data
  } catch {
    return {}
  }
}

const checkRLHealth = async () => {
  try {
    const response = await axios.get(
      `${RL_BASE_URL}/health`,
      { timeout: 5_000 },
    )
    return response.data
  } catch {
    return { status: 'unreachable', model_loaded: false }
  }
}

module.exports = { getRLSchedule, getRLState, checkRLHealth }