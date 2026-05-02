import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// ── v6 — adds new trigger types for dynamic prediction updates
//
// NEW TRIGGER TYPES ADDED:
//   'task-created'    — new task added to project → pendingTaskCount changed
//   'task-updated'    — task complexity/dueDate/assignee changed
//   'task-reassigned' — task moved to different student → both students affected
//   'status-updated'  — task status changed (not Completed — that uses task-completed)
//   'project-updated' — project dueDate or complexity changed → all members affected
//
// v6.1 — adds 3 fields from research formula implementation:
//   'deadlinePressure'    — remainingTasks / daysLeft (core research formula)
//   'complexityCapacity'  — max realistic tasks/day for this project difficulty
//   'totalTaskCount'      — total tasks assigned to this student in the project

const BPredictionSchema = new Schema(
  {
    studentId: { type: Types.ObjectId, ref: 'User',     required: true },
    projectId: { type: Types.ObjectId, ref: 'BProject', required: true },

    // ── Main status (v4 unchanged) ──────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['on-track', 'at-risk', 'in-danger', 'not-started', 'complete'],
      default: 'not-started',
    },
    longTermStatus: {
      type:    String,
      enum:    ['on-track', 'at-risk', 'in-danger', 'not-started', 'complete', null],
      default: null,
    },
    dailyStatus: {
      type:    String,
      enum:    ['on-track', 'at-risk', 'in-danger', null],
      default: null,
    },

    // ── v5: RAP Status — 2-axis combined label ──────────────────────────────
    rapStatus: {
      type:    String,
      enum:    [
        'on-track',
        'on-track-fragile',
        'at-risk-recoverable',
        'at-risk',
        'danger-recoverable',
        'in-danger',
        'complete',
        'not-started',
        null,
      ],
      default: null,
    },

    // ── v5: Human-readable RAP explanation ──────────────────────────────────
    rapMessage: { type: String, default: null },

    // ── Scores (v4 unchanged) ───────────────────────────────────────────────
    trajectoryScore: { type: Number, default: null },
    completionScore: { type: Number, default: null },

    // ── v5: Resilience Score 0–100 ─────────────────────────────────────────
    resilienceScore: { type: Number,  default: null },
    isResilient:     { type: Boolean, default: null },

    // ── v5: Complexity Feasibility Gate ─────────────────────────────────────
    complexityFeasibility: {
      type:    String,
      enum:    ['possible', 'constrained', 'impossible', null],
      default: null,
    },

    // ── v5: Recovery projection ─────────────────────────────────────────────
    burstRateNeeded:     { type: Number, default: null },
    burstFeasibilityPct: { type: Number, default: null },
    timeLeftPct:         { type: Number, default: null },

    // ── Ratio breakdown (v4 unchanged) ──────────────────────────────────────
    studentRatio: { type: Number, default: null },
    projectRatio: { type: Number, default: null },
    globalRatio:  { type: Number, default: null },
    dataSource:   {
      type:    String,
      enum:    ['global', 'blended', 'project', null],
      default: null,
    },

    // ── Daily target (v4 unchanged) ─────────────────────────────────────────
    dailyTarget:         { type: Number, default: null },
    requiredRate:        { type: Number, default: null },
    todayCompletedCount: { type: Number, default: 0 },
    dailyRate:           { type: Number, default: null },

    // ── Multi-project load (v4 unchanged) ───────────────────────────────────
    loadFactor:     { type: Number, default: 1.0 },
    activeProjects: { type: Number, default: 1 },

    // ── Projection (v4 unchanged) ───────────────────────────────────────────
    projectedFinishDate: { type: Date,   default: null },
    daysLeft:            { type: Number, default: null },
    projectedDaysNeeded: { type: Number, default: null },

    // ── Progress (v4 unchanged) ─────────────────────────────────────────────
    pendingTaskCount:  { type: Number, default: null },
    workCompletionPct: { type: Number, default: null },
    timeElapsedPct:    { type: Number, default: null },
    paceDelta:         { type: Number, default: null },

    // ── Warnings (v4 unchanged) ─────────────────────────────────────────────
    capacityWarning: { type: String, default: null },

    // ── Cold start flags (v4 unchanged) ─────────────────────────────────────
    coldStart:         { type: Boolean, default: true },
    newProjectPending: { type: Boolean, default: false },
    completionsNeeded: { type: Number,  default: 4 },

    // ── Confidence (v4 unchanged) ───────────────────────────────────────────
    confidence:     { type: Number,  default: 0.30 },
    dataPointsUsed: { type: Number,  default: 0 },
    isEstimated:    { type: Boolean, default: true },

    // ── NEW v6.1: Research formula fields ───────────────────────────────────
    //
    // deadlinePressure — the core formula from the research:
    //   deadlinePressure = pendingTaskCount / daysLeft
    //   Tells us: tasks per day required to finish on time
    //   Example: 6 tasks left, 2 days → pressure = 3.0 (very high)
    //            6 tasks left, 6 days → pressure = 1.0 (comfortable)
    deadlinePressure: { type: Number, default: null },

    // complexityCapacity — maximum realistic tasks/day for this project type
    //   Low    = 2.0 tasks/day
    //   Medium = 1.5 tasks/day
    //   High   = 1.0 tasks/day
    // Used to judge whether deadlinePressure is achievable
    complexityCapacity: { type: Number, default: null },

    // totalTaskCount — total tasks assigned to this student in the project
    // Used to calculate workCompletionPct = doneTasks / totalTaskCount
    totalTaskCount: { type: Number, default: null },

    // ── Trigger metadata — v6: added 5 new trigger types ────────────────────
    lastTriggerType: {
      type:    String,
      enum:    [
        // ── Original triggers (v4–v5) ──
        'task-completed',
        'task-overdue',
        'initial',
        'manual',
        'test',
        'daily-refresh',
        'rebalance',
        // ── NEW triggers (v6) ──
        'task-created',
        'task-updated',
        'task-reassigned',
        'status-updated',
        'project-updated',
        'project-deleted',  // ✅ ADDED
    'project-closed',
      ],
      default: 'initial',
    },
    lastTriggerDate:   { type: Date,           default: null },
    triggeredByTaskId: { type: Types.ObjectId, default: null },
  },
  { timestamps: true, collection: 'BPredictions' }
);

BPredictionSchema.index({ studentId: 1, projectId: 1 }, { unique: true });

export default mongoose.models.BPrediction || model('BPrediction', BPredictionSchema);