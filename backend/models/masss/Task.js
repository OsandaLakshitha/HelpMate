const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    moduleId: {
      // Required — every task belongs to a module
      // Mirrors module_id FK in task.py
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'MasssModule',
      required: [true, 'Module is required'],
      index:    true,
    },

    examId: {
      // Optional — task may be linked to an exam
      // Mirrors exam_id FK in task.py (nullable)
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'MasssExam',
      default: null,
    },

    name: {
      type:     String,
      required: [true, 'Task name is required'],
      trim:     true,
    },

    description: {
      // Mirrors description nullable String column
      type:    String,
      default: null,
    },

    priority: {
      // Mirrors PriorityLevel enum — low / medium / high
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },

    difficulty: {
      // 1–5 integer — mirrors difficulty Integer column
      type:    Number,
      default: 3,
      min:     1,
      max:     5,
    },

    status: {
      // Mirrors TaskStatus enum
      type:    String,
      enum:    ['pending', 'in_progress', 'completed', 'archived'],
      default: 'pending',
    },

    estimatedPomodoros: {
      // Mirrors estimated_pomodoros Integer column
      type:    Number,
      default: 1,
      min:     1,
    },

    sessionsCount: {
      // Mirrors sessions_count — incremented by sessionController on complete
      type:    Number,
      default: 0,
      min:     0,
    },

    deadline: {
      // Mirrors deadline DateTime nullable column
      type:    Date,
      default: null,
    },

    isFixed: {
      // Mirrors is_fixed Boolean column
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // replaces created_at from task.py
  },
)

// ── Indexes ───────────────────────────────────────────────────────────────────
taskSchema.index({ userId: 1 })
taskSchema.index({ moduleId: 1 })
taskSchema.index({ userId: 1, status: 1 })
taskSchema.index({ userId: 1, status: 1, priority: 1 })
taskSchema.index({ userId: 1, deadline: 1 })

module.exports = mongoose.model('MasssTask', taskSchema)