const { MasssTask, MasssModule } = require('../../models/masss')

// ── GET /tasks/ ───────────────────────────────────────────────────────────────
// Mirrors read_tasks() — supports status, module_id, exam_id, priority, difficulty filters
exports.getAll = async (req, res) => {
  try {
    // const { status, module_id, exam_id, priority, difficulty } = req.query
    const { status, module_id, exam_id, priority, difficulty, include_archived } = req.query

    const filter = { userId: req.user.id }

    // If no status filter → exclude archived (mirrors FastAPI behaviour)
if (status) {
  filter.status = status
} else if (!include_archived || include_archived === 'false') {
  filter.status = { $ne: 'archived' }
}

    if (module_id)  filter.moduleId  = module_id
    if (exam_id)    filter.examId    = exam_id
    if (priority)   filter.priority  = priority
    if (difficulty) filter.difficulty = Number(difficulty)

    const tasks = await MasssTask.find(filter)
      .populate('moduleId', 'name color category')
      .populate('examId',   'name dueDate weight examType')
      .lean()

    res.json({ success: true, data: tasks })
  } catch (error) {
    console.error('[MASSS] getAll tasks error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /tasks/:id ────────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const task = await MasssTask.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    })
      .populate('moduleId', 'name color category')
      .populate('examId',   'name dueDate weight')
      .lean()

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    res.json({ success: true, data: task })
  } catch (error) {
    console.error('[MASSS] getOne task error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── POST /tasks/ ──────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      name,
      description,
      module_id,
      exam_id,
      priority            = 'medium',
      difficulty          = 3,
      estimated_pomodoros = 1,
      deadline,
      is_fixed            = false,
    } = req.body

    if (!name || !module_id) {
      return res.status(400).json({
        success: false,
        message: 'name and module_id are required',
      })
    }

    // Verify module ownership — mirrors create_task() module check
    const module = await MasssModule.findOne({
      _id:    module_id,
      userId: req.user.id,
    })

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or access denied',
      })
    }

    const task = await MasssTask.create({
      userId:             req.user.id,
      name,
      description:        description || null,
      moduleId:           module_id,
      examId:             exam_id || null,
      priority,
      difficulty,
      estimatedPomodoros: estimated_pomodoros,
      deadline:           deadline || null,
      isFixed:            is_fixed,
      sessionsCount:      0,
    })

    const populated = await MasssTask.findById(task._id)
      .populate('moduleId', 'name color category')
      .populate('examId',   'name dueDate weight')
      .lean()

    res.status(201).json({ success: true, data: populated })
  } catch (error) {
    console.error('[MASSS] create task error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── PATCH /tasks/:id ──────────────────────────────────────────────────────────
// Mirrors update_task() — only updates fields that are sent
exports.update = async (req, res) => {
  try {
    const ALLOWED = [
      'name', 'description', 'priority', 'difficulty',
      'estimated_pomodoros', 'deadline', 'is_fixed', 'status', 'exam_id',
    ]

    // Map snake_case body fields to camelCase model fields
    const updateMap = {
      name:                'name',
      description:         'description',
      priority:            'priority',
      difficulty:          'difficulty',
      estimated_pomodoros: 'estimatedPomodoros',
      deadline:            'deadline',
      is_fixed:            'isFixed',
      status:              'status',
      exam_id:             'examId',
    }

    const update = {}
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        update[updateMap[key]] = req.body[key]
      }
    }

    const task = await MasssTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: update },
      { new: true },
    )
      .populate('moduleId', 'name color category')
      .populate('examId',   'name dueDate weight')
      .lean()

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    res.json({ success: true, data: task })
  } catch (error) {
    console.error('[MASSS] update task error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── DELETE /tasks/:id ─────────────────────────────────────────────────────────
// Soft delete — mirrors archive_task() — sets status to 'archived'
exports.archive = async (req, res) => {
  try {
    const task = await MasssTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { status: 'archived' } },
      { new: true },
    )

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    res.json({ success: true, message: 'Task archived successfully' })
  } catch (error) {
    console.error('[MASSS] archive task error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}