/**
 * heuristicScheduler.js
 * ----------------------
 * Node.js port of heuristic.py + scheduling.py
 * Rule-based greedy scheduler — always available, no RL model needed.
 */

const { MasssTask, MasssProfile } = require('../../models/masss')

// ── Score calculator — mirrors _calculate_score() ────────────────────────────
const calculateScore = (task, today) => {
  // IN_PROGRESS tasks always go first
  if (task.status === 'in_progress') return 10000.0

  const PRIO_MAP = { high: 3, medium: 2, low: 1 }
  let score = (PRIO_MAP[task.priority] || 1) * 2

  // Deadline urgency
  const targetDate = task.examId?.dueDate || task.deadline
  if (targetDate) {
    const daysUntil = Math.floor((new Date(targetDate) - today) / 86_400_000)
    score += 10 / Math.max(0.1, daysUntil)
  } else {
    score += 0.3
  }

  // Exam weight bonus
  if (task.examId?.weight) {
    score += task.examId.weight * 0.5
  }

  return score
}

// ── Main scheduler ────────────────────────────────────────────────────────────
const generateHeuristicSchedule = async (userId) => {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const currentHour = now.getHours()

  // ── Get slot preferences for capacity ────────────────────────────────────
  const profile = await MasssProfile.findOne({ userId }).lean()
  const prefs   = profile?.slotPreferences || []

  // Build capacity map — default 4 per slot
  const capacity = { morning: 4, afternoon: 4, evening: 4 }
  for (const p of prefs) {
    if (p.slotName && p.maxPomodoros) {
      capacity[p.slotName] = p.maxPomodoros
    }
  }

  // Zero out slots that have already passed — mirrors _get_daily_capacity()
  if (currentHour >= 12) capacity.morning   = 0
  if (currentHour >= 18) capacity.afternoon = 0

  // ── Reduce capacity for classes/work today ────────────────────────────────
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const routine   = profile?.weeklyRoutine || []

  for (const r of routine) {
    if (r.dayOfWeek !== todayName) continue
    if (!['class', 'work'].includes(r.activityType)) continue

    const [startH] = (r.startTime || '0:0').split(':').map(Number)
    const [endH]   = (r.endTime   || '0:0').split(':').map(Number)
    const startDec = startH
    const endDec   = endH
    const duration = Math.max(0, endDec - startDec)
    const lostPomos = Math.floor(duration * 2)
    const midpoint  = (startDec + endDec) / 2

    if (midpoint >= 6  && midpoint < 12) capacity.morning   = Math.max(0, capacity.morning   - lostPomos)
    else if (midpoint >= 12 && midpoint < 18) capacity.afternoon = Math.max(0, capacity.afternoon - lostPomos)
    else                                      capacity.evening   = Math.max(0, capacity.evening   - lostPomos)
  }

  // ── Fetch tasks ───────────────────────────────────────────────────────────
  const allTasks = await MasssTask.find({
    userId,
    status: { $in: ['pending', 'in_progress'] },
  })
    .populate('moduleId', 'name category')
    .populate('examId',   'dueDate weight')
    .lean()

  const fixedTasks    = allTasks.filter((t) => t.isFixed)
  const floatingTasks = allTasks.filter((t) => !t.isFixed)

  const schedule = { morning: [], afternoon: [], evening: [] }
  const slotOrder = ['morning', 'afternoon', 'evening']

  // ── Format helper — mirrors _format_task() ────────────────────────────────
  const formatTask = (task, sessions, allocationType) => ({
    task_id:          String(task._id),
    task_name:        task.name,
    module:           task.moduleId?.name || 'General',
    assigned_sessions: sessions,
    priority:         task.priority,
    status:           task.status,
    allocation_type:  allocationType,
  })

  // ── Schedule fixed tasks first ────────────────────────────────────────────
  for (const task of fixedTasks) {
    let needed = Math.max(1, (task.estimatedPomodoros || 1) - (task.sessionsCount || 0))
    for (const slot of slotOrder) {
      if (needed <= 0) break
      if (capacity[slot] > 0) {
        const take = Math.min(needed, capacity[slot])
        schedule[slot].push(formatTask(task, take, 'fixed'))
        capacity[slot] -= take
        needed -= take
      }
    }
  }

  // ── Sort floating tasks by score ──────────────────────────────────────────
  floatingTasks.sort((a, b) => calculateScore(b, today) - calculateScore(a, today))

  // ── Schedule floating tasks ───────────────────────────────────────────────
  for (const task of floatingTasks) {
    let needed = Math.max(1, (task.estimatedPomodoros || 1) - (task.sessionsCount || 0))
    for (const slot of slotOrder) {
      if (needed <= 0) break
      if (capacity[slot] > 0) {
        const take = Math.min(needed, capacity[slot])
        schedule[slot].push(formatTask(task, take, 'auto'))
        capacity[slot] -= take
        needed -= take
      }
    }
  }

  return schedule
}

module.exports = { generateHeuristicSchedule }