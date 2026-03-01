import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// ── Purpose ────────────────────────────────────────────────────────────────
// One record per student per project.
// Always upserted — never create a second document for same student+project.
// Updated when: task completed, task overdue (cron), tasks first generated.

const BPredictionSchema = new Schema(
  {
    studentId: { type: Types.ObjectId, ref: 'User',     required: true },
    projectId: { type: Types.ObjectId, ref: 'BProject', required: true },

    // Main output
    status: {
      type:    String,
      enum:    ['on-track', 'at-risk', 'in-danger', 'not-started', 'complete'],
      default: 'not-started',
      // not-started = tasks exist but no completions yet
      // on-track    = CS >= 100
      // at-risk     = CS 80-99
      // in-danger   = CS < 80
      // complete    = all tasks done
    },

    completionScore:  { type: Number, default: null },
    // The CS value driving the status above

    pssAtCalculation: { type: Number, default: null },
    // PSS snapshot used when this was computed

    // Projection
    projectedFinishDate: { type: Date,   default: null },
    daysLeft:            { type: Number, default: null },
    projectedDaysNeeded: { type: Number, default: null },
    bufferDays:          { type: Number, default: null },
    // positive = finishing early   negative = will miss deadline

    // Pace analysis
    workCompletionPct: { type: Number, default: null },
    // % of complexity weight completed
    timeElapsedPct:    { type: Number, default: null },
    // % of assignment duration elapsed
    paceDelta:         { type: Number, default: null },
    // workCompletionPct − timeElapsedPct
    // positive = ahead   negative = behind

    // Multi-project context
    concurrentProjects:     { type: Number,  default: 0    },
    timeSharePct:           { type: Number,  default: 100  },
    multiProjectDowngraded: { type: Boolean, default: false },

    // Overdue tracking
    overdueTaskCount: { type: Number, default: 0 },
    totalOverdueDays: { type: Number, default: 0 },

    // Confidence
    confidence:     { type: Number,  default: 0.30 },
    // Math.min(0.95, 0.30 + dataPoints × 0.05)
    dataPointsUsed: { type: Number,  default: 0    },
    isEstimated:    { type: Boolean, default: true  },
    // true when dataPoints < 3 — show low confidence badge on UI

    // Trigger metadata
    lastTriggerType: {
      type:    String,
      enum:    ['task-completed', 'task-overdue', 'initial', 'manual'],
      default: 'initial',
    },
    lastTriggerDate:   { type: Date,           default: null },
    triggeredByTaskId: { type: Types.ObjectId, default: null },
  },
  { timestamps: true, collection: 'BPredictions' }
);

// Enforced at DB level — always use updateOne with upsert:true
BPredictionSchema.index({ studentId: 1, projectId: 1 }, { unique: true });

export default model('BPrediction', BPredictionSchema);