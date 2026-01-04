import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  githubRepoUrl: String,
  githubVerified: { type: Boolean, default: false },
  creatorId: { type: Types.ObjectId, ref: 'User', required: true },
  supervisorEmail: String, // optional
  startDate: { type: Date, default: Date.now },
  dueDate: Date,
  complexity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  projectType: { type: String, enum: ['Coding', 'Documentation', 'Both', 'Other'], default: 'Documentation' },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  memberIds: [{ type: Types.ObjectId, ref: 'User' }],
  interactionCount: { type: Number, default: 0 },
  topContributor: {
    userId: { type: Types.ObjectId, ref: 'User' },
    percent: { type: Number, default: 0 }
  }
}, { timestamps: true, collection: 'BProject' });

export default model('BProject', ProjectSchema);
