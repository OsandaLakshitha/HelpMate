const mongoose = require('mongoose')

const moduleSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    name: {
      type:     String,
      required: [true, 'Module name is required'],
      trim:     true,
    },

    color: {
      // Hex colour string — default matches module.py default
      type:    String,
      default: '#E89BAE',
    },

    category: {
      // Mirrors Category enum in module.py
      type:    String,
      enum:    ['coding', 'math_logic', 'language', 'creative_design', 'memorization', 'other'],
      default: 'other',
    },

    energyTime: {
      // Mirrors EnergyTime enum — best study slot for this module
      type:    String,
      enum:    ['morning', 'afternoon', 'evening'],
      default: 'afternoon',
    },
  },
  {
    timestamps: true,

    // Virtual populate — does NOT store exam/task ids in this document.
    // Tasks and Exams store moduleId — we query them when needed.
    // This keeps deletes clean without needing to maintain arrays.
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  },
)

// ── Virtual: tasks ────────────────────────────────────────────────────────────
// Populated on demand with Module.findOne(...).populate('tasks')
moduleSchema.virtual('tasks', {
  ref:          'MasssTask',
  localField:   '_id',
  foreignField: 'moduleId',
})

// ── Virtual: exams ────────────────────────────────────────────────────────────
moduleSchema.virtual('exams', {
  ref:          'MasssExam',
  localField:   '_id',
  foreignField: 'moduleId',
})

// ── Indexes ───────────────────────────────────────────────────────────────────
moduleSchema.index({ userId: 1 })
moduleSchema.index({ userId: 1, name: 1 })

module.exports = mongoose.model('MasssModule', moduleSchema)