const mongoose = require('mongoose')

// ── SlotPreference subdocument ────────────────────────────────────────────────
// Mirrors SlotPreference table in profile.py
// One document per slot (morning / afternoon / evening)

const slotPreferenceSchema = new mongoose.Schema(
  {
    slotName: {
      type:     String,
      enum:     ['morning', 'afternoon', 'evening'],
      required: true,
    },
    slotLabel: {
      type:    String,
      default: null,
    },
    startTime: {
      // Stored as "HH:MM" string — matches Time column in PostgreSQL
      type:    String,
      default: null,
    },
    endTime: {
      type:    String,
      default: null,
    },
    maxPomodoros: {
      type:    Number,
      default: 4,
      min:     1,
      max:     48,
    },
    inferredEnergyScore: {
      // Float 0.0 – 1.0 — mirrors inferred_energy_score column
      type:    Number,
      default: 0.5,
      min:     0,
      max:     1,
    },
    isPreferred: {
      type:    Boolean,
      default: false,
    },
  },
  { _id: true }, // keep _id so frontend can reference individual slots
)

// ── WeeklyRoutine subdocument ─────────────────────────────────────────────────
// Mirrors WeeklyRoutine table in profile.py

const weeklyRoutineSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    activityType: {
      // Mirrors ActivityType enum — class / sleep / habit / work
      type:    String,
      enum:    ['class', 'sleep', 'habit', 'work'],
      default: 'class',
    },
    dayOfWeek: {
      // Mirrors DayOfWeek enum
      type:     String,
      enum:     ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    startTime: {
      // "HH:MM" string
      type:     String,
      required: true,
    },
    endTime: {
      type:     String,
      required: true,
    },
  },
  { _id: true },
)

// ── Profile document ──────────────────────────────────────────────────────────
// One profile per Helpmate user.
// Created on first onboarding request (upserted).

const profileSchema = new mongoose.Schema(
  {
    userId: {
      // References Helpmate's User._id — the same _id from req.user.id
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,  // one profile per user
      index:    true,
    },

    chronotype: {
      // Mirrors Chronotype enum in profile.py
      type:    String,
      enum:    ['morning_bird', 'night_owl', 'balanced'],
      default: 'balanced',
    },

    onboardingCompleted: {
      type:    Boolean,
      default: false,
    },

    // Embeds all three slot preferences (morning / afternoon / evening)
    slotPreferences: {
      type:    [slotPreferenceSchema],
      default: [],
    },

    // Embeds all weekly routine events (one document per day per event)
    weeklyRoutine: {
      type:    [weeklyRoutineSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

// ── Indexes ───────────────────────────────────────────────────────────────────
profileSchema.index({ userId: 1 })

// ── Helper: find or create profile ───────────────────────────────────────────
// Used by onboarding controller to safely upsert on first access.
profileSchema.statics.findOrCreate = async function (userId) {
  let profile = await this.findOne({ userId })
  if (!profile) {
    profile = await this.create({ userId })
  }
  return profile
}

module.exports = mongoose.model('MasssProfile', profileSchema)