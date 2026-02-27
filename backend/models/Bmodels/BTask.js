import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const BTaskSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'BProject', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  assigneeId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  assignedById: { type: Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['New', 'In Progress', 'To Be Reviewed', 'Completed'], default: 'New', index: true },
  dueDate: Date,
  startedAt: Date,
  progressAt: Date,
  completedAt: Date,
  proofFiles: [{
    url: String,
    type: { type: String, enum: ['image', 'pdf', 'doc', 'other'], default: 'other' }
  }],
  proofCommits: [{
    sha: String,
    message: String,
    authorName: String,
    authoredAt: Date
  }]
}, { timestamps: true, collection: 'BTasks' });

export default model('BTask', BTaskSchema);

//proofFiles: [{ url: String, type: { type: String, enum: ['image', 'pdf', 'doc', 'other'], default: 'other' }, addedBy: { type: Types.ObjectId, ref: 'User' }, addedAt: Date }],