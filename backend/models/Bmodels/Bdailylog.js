import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// ── Purpose ────────────────────────────────────────────────────────────────────
// One document per student per project per day.
// Upserted every time prediction recalculates.
// Core research dataset — NEVER delete these records.
//
// v5 changes (RAP):
//   ADDED: rapStatus, resilienceScore, complexityFeasibility

const BDailyLogSchema = new Schema({
  studentId: { type: Types.ObjectId, ref: 'User',     required: true, index: true },
  projectId: { type: Types.ObjectId, ref: 'BProject', required: true, index: true },

  date: { type: String, required: true },
  // YYYY-MM-DD — unique key per student per project per day

  // ── Daily target (SYSTEM GENERATED — never manually entered) ──────────────
  // Written by predictionEngine.js automatically on every recalculate() call
  // Student never sets this — engine calculates: ceil(pendingTasks/daysLeft × loadFactor)
  targetTaskCount:    { type: Number, required: true },
  completedTaskCount: { type: Number, default: 0 },
  dailyRatio:         { type: Number, default: 0 },
  targetMet:          { type: Boolean, default: false },
  remainingTaskCount: { type: Number, default: 0 },
  daysLeft:           { type: Number, default: 0 },
  trajectoryScore:    { type: Number, default: null },
  studentRatio:       { type: Number, default: null },
  projectRatio:       { type: Number, default: null },
  globalRatio:        { type: Number, default: null },
  activeProjects:     { type: Number, default: 1 },
  loadFactor:         { type: Number, default: 1.0 },
  status: {
    type:    String,
    enum:    ['on-track', 'at-risk', 'in-danger', 'complete', 'not-started'],
    default: 'not-started',
  },
  projectComplexity: {
    type:    String,
    enum:    ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  confidence:  { type: Number, default: 0 },
  dataSource:  { type: String, enum: ['global', 'blended'], default: 'global' },
//dataSource:  { type: String, enum: ['global', 'blended', 'project'], default: 'global' },
  deadlinePressure: { type: Number, default: null },

  // ── v5 RAP fields ──────────────────────────────────────────────────────────
  rapStatus: {
    type: String,
    enum: [
      'on-track', 'on-track-fragile',
      'at-risk-recoverable', 'at-risk',
      'danger-recoverable', 'in-danger',
      'complete', 'not-started',
    ],
    default: null,
  },
  resilienceScore: { type: Number, default: null },
  complexityFeasibility: {
    type:    String,
    enum:    ['possible', 'constrained', 'impossible'],
    default: null,
  },

}, { timestamps: true, collection: 'BDailyLogs' });

BDailyLogSchema.index({ studentId: 1, projectId: 1, date: 1 }, { unique: true });
BDailyLogSchema.index({ studentId: 1, date: 1 });

export default model('BDailyLog', BDailyLogSchema);