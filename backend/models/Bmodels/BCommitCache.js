import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const BCommitCacheSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'BProject', index: true },
  repo: String,
  commits: [{
    sha: String,
    message: String,
    authorName: String,
    authoredAt: Date
  }],
  fetchedAt: { type: Date, default: Date.now }
}, { timestamps: false, collection: 'BCommitCaches' });

export default model('BCommitCache', BCommitCacheSchema);
