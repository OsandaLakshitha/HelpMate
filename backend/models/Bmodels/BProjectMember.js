import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const BProjectMemberSchema = new Schema({
  projectId:         { type: Types.ObjectId, ref: 'BProject', required: true, index: true },
  userId:            { type: Types.ObjectId, ref: 'User',     required: true, index: true },
  email:             String,
  componentName:     String,
  individualPart:    String,
  contributionTotal: { type: Number, default: 0 },
  activeTimeMinutes: { type: Number, default: 0 },
  mlScore:           { type: Number },
  tasksGenerated:    { type: Boolean, default: false },
  tasksGeneratedAt:  { type: Date },

  availableTime: {
    weekdays: { type: Number, default: 2 },
    weekends:  { type: Number, default: 4 },
  },

  // ── NEW: Priority + Scheduling Mode ──────────────────────────────────────
  priority: {
    type:    String,
    enum:    ['high', 'medium', 'low'],
    default: 'medium',
    // high   → 1.5 weight in hybrid formula → more daily hours
    // medium → 1.0 weight
    // low    → 0.6 weight → fewer daily hours
  },

  schedulingMode: {
    type:    String,
    enum:    ['linear', 'parallel'],
    default: 'parallel',
    // parallel → work on all projects every day, hours split by formula
    // linear   → finish this project before others
    //            (earlier deadlines still protected automatically)
  },

  lastRebalancedAt: { type: Date },

}, { timestamps: true, collection: 'BProjectMembers' });

BProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export default model('BProjectMember', BProjectMemberSchema);