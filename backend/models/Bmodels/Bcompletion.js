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
  },
  { timestamps: true, collection: 'BCompletions' }
);

BCompletionSchema.index({ studentId: 1, createdAt: -1 });
BCompletionSchema.index({ studentId: 1, projectId: 1 });

export default model('BCompletion', BCompletionSchema);