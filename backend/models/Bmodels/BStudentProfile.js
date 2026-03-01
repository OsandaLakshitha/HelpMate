import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// ── Purpose ────────────────────────────────────────────────────────────────
// Completely separate from User.js — User.js is never modified.
// Created automatically on first workspace visit (onboarding page).
// Stores everything the prediction engine needs about a student.

const BStudentProfileSchema = new Schema(
  {
    // One profile per user
    userId: {
      type:     Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
      index:    true,
    },

    // Global study hours — collected at onboarding
    // Used in workload check and CS formula
    availableTime: {
      weekdays: { type: Number, default: 2, min: 0.5, max: 8  },
      weekends: { type: Number, default: 4, min: 0.5, max: 12 },
    },

    // PSS — Personal Speed Score
    // Updated every time student completes a task
    // Formula: Σ(speedRatio × complexity²) / Σ(complexity²)
    pss: {
      score:       { type: Number,  default: 0.85 },
      // 1.0 = on pace | >1.0 = faster | <1.0 = slower
      dataPoints:  { type: Number,  default: 0    },
      // number of completions that fed into this score
      lastUpdated: { type: Date,    default: null  },
      isEstimated: { type: Boolean, default: true  },
      // true when dataPoints < 3 — show low confidence badge
    },

    // Academic details — optional
    courseCode: { type: String, default: null },
    batchYear:  { type: String, default: null },

    // Onboarding gate — if false, redirect to /user/onboarding on login
    onboardingCompleted:   { type: Boolean, default: false },
    onboardingCompletedAt: { type: Date,    default: null  },
  },
  { timestamps: true, collection: 'BStudentProfiles' }
);

export default model('BStudentProfile', BStudentProfileSchema);