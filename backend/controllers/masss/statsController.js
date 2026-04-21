const { MasssSession, MasssTask } = require('../../models/masss')
const { getRLSchedule, getRLState, checkRLHealth } = require('../../services/masss/rlClient')
const { generateHeuristicSchedule } = require('../../services/masss/heuristicScheduler')

// ── GET /stats/dashboard-summary ─────────────────────────────────────────────
// Port of get_dashboard_stats() in stats.py
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id
    const today  = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 1. Last 7 sessions for heartbeat chart — matches stats.py
    const recentSessions = await MasssSession.find({ userId })
      .sort({ startTime: -1 })
      .limit(7)
      .lean()

    // Reverse so newest is on the right of the chart
    const recentRatings = recentSessions
      .slice()
      .reverse()
      .map((s) => parseFloat(s.focusRating || 3.0))

    // 2. Last task name
    let lastTaskName = 'No sessions yet'
    if (recentSessions.length > 0) {
      const lastTask = await MasssTask.findById(recentSessions[0].taskId).lean()
      lastTaskName = lastTask?.name || 'Unknown Task'
    }

    // 3. Streak — consecutive days with at least one completed session
    let streak    = 0
    let checkDate = new Date(today)

    while (true) {
      const nextDate = new Date(checkDate)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await MasssSession.countDocuments({
        userId,
        startTime: { $gte: checkDate, $lt: nextDate },
        endType:   'completed',
      })

      if (count > 0) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // 4. Best focus this week
    const weekAgo      = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const bestFocusResult = await MasssSession.findOne({
      userId,
      startTime:    { $gte: weekAgo },
      focusRating:  { $ne: null },
    })
      .sort({ focusRating: -1 })
      .lean()

    const bestFocus = parseFloat(bestFocusResult?.focusRating || 0)

    // 5. Sessions today
    const sessionsToday = await MasssSession.countDocuments({
      userId,
      startTime: { $gte: today, $lt: tomorrow },
    })

    const recentAvgFocus = recentRatings.length
      ? recentRatings.reduce((s, v) => s + v, 0) / recentRatings.length
      : 0

    res.json({
      success: true,
      data: {
        recent_ratings:   recentRatings,
        last_task_name:   lastTaskName,
        streak_days:      streak,
        best_focus_week:  bestFocus,
        sessions_today:   sessionsToday,
        recent_avg_focus: parseFloat(recentAvgFocus.toFixed(2)),
      },
    })
  } catch (error) {
    console.error('[MASSS] getDashboardSummary error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /stats/health ─────────────────────────────────────────────────────────
exports.getHealth = async (req, res) => {
  try {
    const rlStatus = await checkRLHealth()

    res.json({
      success:          true,
      main_api:         'ok',
      rl_service:       rlStatus.status || 'unreachable',
      rl_model_loaded:  rlStatus.model_loaded || false,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /rl/state-vector ──────────────────────────────────────────────────────
// Port of rl_state.py get_state_vector()
exports.getStateVector = async (req, res) => {
  try {
    const activeSlot = req.query.active_slot || 'morning'

    if (!['morning', 'afternoon', 'evening'].includes(activeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'active_slot must be morning, afternoon, or evening',
      })
    }

    const state = await getRLState(req.user.id, activeSlot)
    res.json({ success: true, data: state })
  } catch (error) {
    console.error('[MASSS] getStateVector error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /schedule/rl ──────────────────────────────────────────────────────────
// Port of schedule.py get_rl_schedule_endpoint()
exports.getRLSchedule = async (req, res) => {
  try {
    const activeSlot = req.query.active_slot || 'morning'

    const schedule = await getRLSchedule(req.user.id, activeSlot)
    res.json({ success: true, data: schedule })
  } catch (error) {
    console.error('[MASSS] getRLSchedule error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /schedule/heuristic ───────────────────────────────────────────────────
// Port of schedule.py get_heuristic_schedule()
exports.getHeuristicSchedule = async (req, res) => {
  try {
    const plan = await generateHeuristicSchedule(req.user.id)

    res.json({
      success: true,
      data: {
        ...plan,
        strategy_used: 'Heuristic (Baseline)',
      },
    })
  } catch (error) {
    console.error('[MASSS] getHeuristicSchedule error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}