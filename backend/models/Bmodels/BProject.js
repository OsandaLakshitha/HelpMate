import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const ProjectSchema = new Schema(
  {
    // ── Original fields — unchanged ───────────────────────────────────────
    title:            { type: String, required: true },
    description:      String,
    githubRepoUrl:    String,
    githubVerified:   { type: Boolean, default: false },
    creatorId:        { type: Types.ObjectId, ref: 'User', required: true },
    supervisorEmail:  String,
    startDate:        { type: Date, default: Date.now },
    dueDate:          Date,
    complexity:       { type: String, enum: ['Low', 'Medium', 'High'],                    default: 'Low' },
    projectType:      { type: String, enum: ['Coding', 'Documentation', 'Both', 'Other'], default: 'Documentation' },
    status:           { type: String, enum: ['Open', 'Closed'],                           default: 'Open' },
    memberIds:        [{ type: Types.ObjectId, ref: 'User' }],
    interactionCount: { type: Number, default: 0 },
    topContributor: {
      userId:  { type: Types.ObjectId, ref: 'User' },
      percent: { type: Number, default: 0 },
    },

    // ── NEW: Assignment PDF ───────────────────────────────────────────────
    pdfName:      { type: String, default: null },  // original filename
    pdfPath:      { type: String, default: null },  // server path
    pdfText:      { type: String, default: null },  // extracted text — stored once, used forever

    // ── NEW: Group plan ───────────────────────────────────────────────────
    approach:     { type: String, default: null },  // what group plans to build

    // ── NEW: Claude-generated summary ─────────────────────────────────────
    generatedDesc: { type: String, default: null }, // 2-3 sentence summary
  },
  { timestamps: true, collection: 'BProject' }
);

export default model('BProject', ProjectSchema);