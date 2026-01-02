// backend/models/Note.js
const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: String
}, { _id: false });

const shortNoteSectionSchema = new mongoose.Schema({
    title: String,
    type: String,
    items: [String]
}, { _id: false });

const flashCardSchema = new mongoose.Schema({
    type: String,
    front: String,
    back: String
}, { _id: false });

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: String,
    moduleCode: {
        type: String,
        index: true
    },
    moduleName: String,
    tags: [String],
    contentPreview: String,
    fullText: String,
    wordCount: Number,
    mcqs: [mcqSchema],
    shortNotes: {
        summary: String,
        sections: [shortNoteSectionSchema],
        totalPoints: Number
    },
    flashCards: [flashCardSchema],
    stats: {
        mcqCount: Number,
        shortNotePoints: Number,
        flashCardCount: Number
    },
    quizAttempts: [{
        score: Number,
        totalQuestions: Number,
        percentage: Number,
        attemptedAt: { type: Date, default: Date.now }
    }],
    isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

noteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);