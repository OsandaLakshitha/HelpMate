import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const BTaskSchema = new Schema(
  {
    // ── Original fields — unchanged ───────────────────────────────────────
    projectId:    { type: Types.ObjectId, ref: 'BProject', required: true, index: true },
    name:         { type: String, required: true },
    description:  { type: String, default: null },
    assigneeId:   { type: Types.ObjectId, ref: 'User', required: true, index: true },
    assignedById: { type: Types.ObjectId, ref: 'User', required: true },

    // Only two statuses — New on creation, Completed when student marks done
    status: {
      type:    String,
      enum:    ['New', 'Completed'],
      default: 'New',
      index:   true,
    },

    dueDate:     Date,
    completedAt: Date,

    // ── NEW: Claude-generated content ─────────────────────────────────────
    isAIGenerated:  { type: Boolean, default: false },

    steps:          [{ type: String }],
    // Step-by-step instructions — shown in task detail view

    youtubeQueries: [{ type: String }],
    // Real YouTube search terms for learning resources

    complexity: {
      type:    Number,
      min:     1,
      max:     5,
      default: null,
      // 1=Very Easy  2=Easy  3=Medium  4=Hard  5=Very Hard
    },

    estimatedHours: { type: Number, default: null },
    // Claude's hour estimate — used in workload check

    estimatedDays:  { type: Number, default: null },
    // dueDate − createdAt in days — used in PSS formula

    // ── NEW: Filled when student marks task complete ───────────────────────
    actualDays:  { type: Number, default: null },
    // completedAt − createdAt in days

    speedRatio:  { type: Number, default: null },
    // estimatedDays / actualDays

    completionState: {
      type:    String,
      enum:    ['good', 'normal', 'late', 'overdue'],
      default: undefined,
      // good    = completed before dueDate
      // normal  = completed within 12hrs after dueDate
      // late    = completed more than 12hrs after dueDate
      // overdue = still New, past dueDate + 12hrs (set by cron)
    },
  },
  { timestamps: true, collection: 'BTasks' }
);

export default model('BTask', BTaskSchema);