import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// ── Purpose ────────────────────────────────────────────────────────────────
// One document created every time a student marks a task complete.
// This is the raw data source for PSS and BCP calculations.
// NEVER delete these records — they are the core research dataset.

const BCompletionSchema = new Schema(
  {
    // References
    taskId:    { type: Types.ObjectId, ref: 'BTask',    required: true },
    studentId: { type: Types.ObjectId, ref: 'User',     required: true },
    projectId: { type: Types.ObjectId, ref: 'BProject', required: true },

    // Claude estimate vs student reality
    estimatedDays:  { type: Number, required: true },
    // task.dueDate − task.createdAt in days

    actualDays:     { type: Number, required: true },
    // task.completedAt − task.createdAt in days

    estimatedHours: { type: Number, default: null  },
    complexity:     { type: Number, required: true },

    // Precomputed values for PSS formula
    // PSS = Σ(weightedSpeedValue) / Σ(complexityWeight)
    speedRatio:         { type: Number, required: true },
    // estimatedDays / actualDays

    complexityWeight:   { type: Number, required: true },
    // complexity²  →  1→1  2→4  3→9  4→16  5→25

    weightedSpeedValue: { type: Number, required: true },
    // speedRatio × complexityWeight

    // Timing outcome
    completedOnTime:  { type: Boolean, required: true },
    daysEarlyOrLate:  { type: Number,  required: true },
    // positive = finished early   negative = finished late

    completionState: {
      type:     String,
      enum:     ['good', 'normal', 'late'],
      required: true,
      // good   = completedAt before dueDate
      // normal = within 12hrs after dueDate
      // late   = more than 12hrs after dueDate
    },

    // PSS value after this completion was added
    pssAfterThis: { type: Number, default: null },

    // ── NEW: Bulk completion detection fields ─────────────────────────────
    // isBulk: true if another task was completed within 10 minutes
    // This indicates student clicked through multiple tasks rapidly
    // rather than genuinely completing them over time
    isBulk: { type: Boolean, default: false },

    // isPastTask: true if task due date was already in the past
    // when student marked it complete
    isPastTask: { type: Boolean, default: false },

    // countForPSS: false if bulk completion
    // Bulk completions do not reflect real speed — excluded from PSS
    countForPSS: { type: Boolean, default: true },

    // countForColdStart: false if bulk AND future task
    // Bulk past tasks still count (student was catching up on real work)
    // Bulk future tasks do not count (gaming the system)
    countForColdStart: { type: Boolean, default: true },

    // ── Anomaly detection fields (v4.1) ───────────────────────────────────
    // Set by anomalyDetector.js — never blocks a completion, just flags it
    anomalyDetected: { type: Boolean, default: false },
    // true if any pattern was found

    anomalyPatterns: [{ type: String }],
    // Array of pattern types detected e.g. ['BURST', 'VELOCITY_SPIKE']
    // Possible values: BURST | SESSION_FLOOD | VELOCITY_SPIKE |
    //                  FIRST_DAY_DUMP | NIGHT_SESSION | SEQUENTIAL_SKIP

    anomalySeverity: {
      type:    String,
      enum:    ['low', 'medium', 'high', null],
      default: null,
    },
    // Worst severity across all detected patterns
  },
  { timestamps: true, collection: 'BCompletions' }
);

BCompletionSchema.index({ studentId: 1, createdAt: -1 });
BCompletionSchema.index({ studentId: 1, projectId: 1 });
BCompletionSchema.index({ studentId: 1, countForPSS: 1 });        // ← NEW: fast PSS queries
BCompletionSchema.index({ studentId: 1, countForColdStart: 1 });   // ← NEW: fast cold start queries

export default model('BCompletion', BCompletionSchema);