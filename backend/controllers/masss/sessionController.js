const { MasssSession, MasssTask, MasssProfile } = require('../../models/masss')
const { getSlotForTime } = require('../../config/masssConstants')

// ── POST /sessions/start ──────────────────────────────────────────────────────
exports.start = async (req, res) => {
  try {
    const { task_id } = req.body

    if (!task_id) {
      return res.status(400).json({ success: false, message: 'task_id is required' })
    }

    // Verify task ownership
    const task = await MasssTask.findOne({
      _id:    task_id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Task is already completed',
      })
    }

    const now = new Date()

    // Detect slot from user's preferences — mirrors get_slot_for_user()
    const profile  = await MasssProfile.findOne({ userId: req.user.id }).lean()
    const slotType = getSlotForTime(profile?.slotPreferences || [], now)

    // Mark task as in_progress — mirrors the momentum signal update
    if (task.status !== 'in_progress') {
      task.status = 'in_progress'
      await task.save()
    }

    const session = await MasssSession.create({
      userId:      req.user.id,
      taskId:      task_id,
      startTime:   now,
      slotType,
      isCompleted: false,
    })

    res.status(201).json({ success: true, data: session })
  } catch (error) {
    console.error('[MASSS] start session error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── POST /sessions/:id/end ────────────────────────────────────────────────────
// Port of end_session() — full logic engine
exports.end = async (req, res) => {
  try {
    const { end_type, focus_rating } = req.body

    const VALID_END_TYPES = ['completed', 'stopped', 'aborted', 'skipped']
    if (!end_type || !VALID_END_TYPES.includes(end_type)) {
      return res.status(400).json({
        success: false,
        message: `end_type must be one of: ${VALID_END_TYPES.join(', ')}`,
      })
    }

    const session = await MasssSession.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    })

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' })
    }

    if (session.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Session already ended',
      })
    }

    // Calculate duration — mirrors duration_seconds logic in session.py
    const endTime = new Date()
    const diffMs  = Math.max(0, endTime - session.startTime)
    const durationMinutes = Math.round((diffMs / 60_000) * 100) / 100

    // Update session fields
    session.endTime         = endTime
    session.durationMinutes = durationMinutes
    session.endType         = end_type
    session.focusRating     = focus_rating || null

    // Fetch linked task for logic updates
    const task = await MasssTask.findById(session.taskId)

    if (task) {
      // ── COMPLETED case ────────────────────────────────────────────────────
      if (end_type === 'completed') {
        session.isCompleted = true
        task.sessionsCount  += 1

        // Auto-extend estimated pomodoros if sessions exceed estimate
        if (task.sessionsCount > task.estimatedPomodoros) {
          task.estimatedPomodoros = task.sessionsCount
        }
      }

      // ── ABORTED case ──────────────────────────────────────────────────────
      // If discarded with zero sessions, reset task to pending
      else if (end_type === 'aborted') {
        if (task.sessionsCount === 0) {
          task.status = 'pending'
        }
      }

      // STOPPED — task stays in_progress automatically

      await task.save()
    }

    await session.save()

    res.json({ success: true, data: session })
  } catch (error) {
    console.error('[MASSS] end session error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /sessions/ ────────────────────────────────────────────────────────────
exports.getRecent = async (req, res) => {
  try {
    const skip  = parseInt(req.query.skip,  10) || 0
    const limit = parseInt(req.query.limit, 10) || 20

    const sessions = await MasssSession.find({ userId: req.user.id })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    res.json({ success: true, data: sessions })
  } catch (error) {
    console.error('[MASSS] getRecent sessions error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}