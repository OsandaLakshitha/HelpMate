const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    taskId: {
      // Mirrors task_id FK in session.py
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'MasssTask',
      required: true,
      index:    true,
    },

    startTime: {
      // Mirrors start_time DateTime — default now
      // Python used get_sl_time() for SL timezone offset.
      // We store UTC and let the frontend handle display timezone.
      type:    Date,
      default: Date.now,
    },

    endTime: {
      // Mirrors end_time DateTime nullable
      type:    Date,
      default: null,
    },

    durationMinutes: {
      // Mirrors duration_minutes Float column
      // Calculated on session end: (endTime - startTime) / 60000
      type:    Number,
      default: 0,
      min:     0,
    },

    isCompleted: {
      // Mirrors is_completed Boolean
      type:    Boolean,
      default: false,
    },

    focusRating: {
      // Mirrors focus_rating Integer nullable (1–5)
      type:    Number,
      default: null,
      min:     1,
      max:     5,
    },

    endType: {
      // Mirrors SessionEndType enum
      type:    String,
      enum:    ['completed', 'stopped', 'aborted', 'skipped'],
      default: 'completed',
    },

    slotType: {
      // Mirrors slot_type String column
      // Detected from user's slot preferences at session start time
      type:     String,
      enum:     ['morning', 'afternoon', 'evening'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// ── Indexes ───────────────────────────────────────────────────────────────────
sessionSchema.index({ userId: 1 })
sessionSchema.index({ taskId: 1 })
sessionSchema.index({ userId: 1, startTime: -1 })  // for recent sessions query
sessionSchema.index({ userId: 1, endType: 1 })
sessionSchema.index({ userId: 1, slotType: 1 })

// ── Instance method: calculate duration ──────────────────────────────────────
// Called by sessionController.end() before saving
sessionSchema.methods.calculateDuration = function () {
  if (this.startTime && this.endTime) {
    const diffMs = new Date(this.endTime) - new Date(this.startTime)
    this.durationMinutes = Math.max(0, Math.round((diffMs / 60000) * 100) / 100)
  }
  return this.durationMinutes
}

module.exports = mongoose.model('MasssSession', sessionSchema)