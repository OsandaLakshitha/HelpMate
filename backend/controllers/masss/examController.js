const { MasssExam, MasssModule } = require('../../models/masss')

// ── GET /exams/module/:moduleId ───────────────────────────────────────────────
exports.getByModule = async (req, res) => {
  try {
    const exams = await MasssExam.find({
      moduleId: req.params.moduleId,
      userId:   req.user.id,
    }).lean()

    res.json({ success: true, data: exams })
  } catch (error) {
    console.error('[MASSS] getByModule exams error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── GET /exams/:id ────────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const exam = await MasssExam.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    }).lean()

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    res.json({ success: true, data: exam })
  } catch (error) {
    console.error('[MASSS] getOne exam error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── POST /exams/module/:moduleId ──────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { moduleId } = req.params
    const { name, exam_type = 'quiz', due_date, weight = 10 } = req.body

    // Verify module ownership — mirrors add_exam() module check
    const module = await MasssModule.findOne({
      _id:    moduleId,
      userId: req.user.id,
    })

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }

    if (!name || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'name and due_date are required',
      })
    }

    const exam = await MasssExam.create({
      userId:   req.user.id,
      moduleId,
      name,
      examType: exam_type,
      dueDate:  due_date,
      weight,
    })

    res.status(201).json({ success: true, data: exam })
  } catch (error) {
    console.error('[MASSS] create exam error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── PUT /exams/:id ────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { name, exam_type, due_date, weight, is_completed } = req.body

    const exam = await MasssExam.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        $set: {
          ...(name          !== undefined && { name }),
          ...(exam_type     !== undefined && { examType: exam_type }),
          ...(due_date      !== undefined && { dueDate: due_date }),
          ...(weight        !== undefined && { weight }),
          ...(is_completed  !== undefined && { isCompleted: is_completed }),
        },
      },
      { new: true },
    )

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    res.json({ success: true, data: exam })
  } catch (error) {
    console.error('[MASSS] update exam error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── DELETE /exams/:id ─────────────────────────────────────────────────────────
exports.delete = async (req, res) => {
  try {
    const exam = await MasssExam.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user.id,
    })

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    res.json({ success: true, message: 'Exam deleted' })
  } catch (error) {
    console.error('[MASSS] delete exam error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}