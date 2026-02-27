import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const BInteractionLogSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'BProject', index: true },
  userId: { type: Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['view', 'task_update', 'comment', 'file_upload'], default: 'view' },
  durationSec: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false, collection: 'BInteractionLogs' });

export default model('BInteractionLog', BInteractionLogSchema);
