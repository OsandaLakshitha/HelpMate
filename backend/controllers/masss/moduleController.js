const { MasssModule, MasssExam, MasssTask } = require('../../models/masss')

// ── GET /modules/ ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const modules = await MasssModule.find({ userId: req.user.id })
      .populate({
        path:    'tasks',
        match:   { status: { $ne: 'archived' } },
        select:  'name status priority sessionsCount estimatedPomodoros deadline',
      })
      .populate({
        path:    'exams',
        select:  'name examType dueDate weight isCompleted',
      })
      .lean({ virtuals: true })

    res.json({ success: true, data: modules })
  } catch (error) {
    console.error('[MASSS] getAll modules error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /modules/:id ──────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const module = await MasssModule.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    })
      .populate({
        path:   'tasks',
        match:  { status: { $ne: 'archived' } },
        select: 'name status priority sessionsCount estimatedPomodoros deadline difficulty isFixed',
      })
      .populate({
        path:   'exams',
        select: 'name examType dueDate weight isCompleted',
      })
      .lean({ virtuals: true })

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }

    res.json({ success: true, data: module })
  } catch (error) {
    console.error('[MASSS] getOne module error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── POST /modules/ ────────────────────────────────────────────────────────────
// Mirrors create_module() — creates module + optional exams in one call
exports.create = async (req, res) => {
  try {
    const {
      name,
      category    = 'other',
      color       = '#E89BAE',
      energy_time = 'afternoon',
      exams       = [],
    } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: 'Module name is required' })
    }

    // Create module
    const module = await MasssModule.create({
      userId: req.user.id,
      name,
      category,
      color,
      energyTime: energy_time,
    })

    // Create linked exams if provided — mirrors db.flush() + exam creation loop
    if (exams.length > 0) {
      const examDocs = exams.map((ex) => ({
        userId:   req.user.id,
        moduleId: module._id,
        name:     ex.name,
        examType: ex.exam_type || ex.examType || 'quiz',
        dueDate:  ex.due_date  || ex.dueDate,
        weight:   ex.weight    || 10,
      }))
      await MasssExam.insertMany(examDocs)
    }

    // Re-fetch with populated data so the response matches getOne shape
    const populated = await MasssModule.findById(module._id)
      .populate({ path: 'tasks', match: { status: { $ne: 'archived' } } })
      .populate({ path: 'exams' })
      .lean({ virtuals: true })

    res.status(201).json({ success: true, data: populated })
  } catch (error) {
    console.error('[MASSS] create module error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── PUT /modules/:id ──────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { name, category, color, energy_time } = req.body

    const module = await MasssModule.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        $set: {
          ...(name        && { name }),
          ...(category    && { category }),
          ...(color       && { color }),
          ...(energy_time && { energyTime: energy_time }),
        },
      },
      { new: true },
    )
      .populate({ path: 'tasks', match: { status: { $ne: 'archived' } } })
      .populate({ path: 'exams' })
      .lean({ virtuals: true })

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }

    res.json({ success: true, data: module })
  } catch (error) {
    console.error('[MASSS] update module error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── DELETE /modules/:id ───────────────────────────────────────────────────────
// Mirrors cascade delete — also removes tasks and exams
exports.delete = async (req, res) => {
  try {
    const module = await MasssModule.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    })

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }

    // Cascade delete — mirrors SQLAlchemy cascade="all, delete-orphan"
    await Promise.all([
      MasssTask.deleteMany({ moduleId: module._id }),
      MasssExam.deleteMany({ moduleId: module._id }),
      module.deleteOne(),
    ])

    res.json({ success: true, message: 'Module and all related data deleted' })
  } catch (error) {
    console.error('[MASSS] delete module error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}