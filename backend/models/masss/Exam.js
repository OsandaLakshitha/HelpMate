const mongoose = require('mongoose')

const examSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    moduleId: {
      // References MasssModule — mirrors module_id FK in exam.py
      // ondelete CASCADE is handled in moduleController.delete()
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'MasssModule',
      required: true,
      index:    true,
    },

    name: {
      type:     String,
      required: [true, 'Exam name is required'],
      trim:     true,
    },

    examType: {
      // Mirrors ExamType enum in exam.py
      type:    String,
      enum:    ['final', 'midterm', 'quiz', 'assignment', 'presentation', 'other'],
      default: 'quiz',
    },

    dueDate: {
      // Mirrors due_date Date column — stored as JS Date
      type:     Date,
      required: [true, 'Due date is required'],
    },

    weight: {
      // Percentage weight of the exam (0–100)
      type:    Number,
      default: 10,
      min:     0,
      max:     100,
    },

    isCompleted: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// ── Indexes ───────────────────────────────────────────────────────────────────
examSchema.index({ userId: 1 })
examSchema.index({ moduleId: 1 })
examSchema.index({ userId: 1, dueDate: 1 })

module.exports = mongoose.model('MasssExam', examSchema)