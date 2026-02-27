import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const BProjectMemberSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'BProject', required: true, index: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  email: String,
  componentName: String,
  contributionTotal: { type: Number, default: 0 },
  activeTimeMinutes: { type: Number, default: 0 },
  freeRidingFlag: { type: Boolean, default: false },
  mlScore: { type: Number }
}, { timestamps: true, collection: 'BProjectMembers' });

BProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export default model('BProjectMember', BProjectMemberSchema);
