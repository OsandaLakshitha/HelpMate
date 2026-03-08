// backend/models/ExamPrep.js
const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: String,
    sourceNote: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }
}, { _id: false });

const flashCardSchema = new mongoose.Schema({
    type: String,
    front: String,
    back: String,
    sourceNote: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }
}, { _id: false });

const shortNoteSectionSchema = new mongoose.Schema({
    title: String,
    type: String,
    items: [String]
}, { _id: false });

const examPrepSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    examId: {
        type: String,
        required: true,
        index: true
    },
    moduleCode: {
        type: String,
        required: true,
        index: true
    },
    moduleName: String,
    title: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    sourceNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    mcqs: [mcqSchema],
    flashCards: [flashCardSchema],
    shortNotes: {
        summary: String,
        sections: [shortNoteSectionSchema],
        totalPoints: Number
    },
    stats: {
        mcqCount: Number,
        flashCardCount: Number,
        shortNotePoints: Number,
        notesUsed: Number,
        totalWords: Number
    },
    // Track study progress
    quizAttempts: [{
        score: Number,
        totalQuestions: Number,
        percentage: Number,
        attemptedAt: { type: Date, default: Date.now }
    }],
    flashCardProgress: {
        known: [Number],    // Indices of cards marked as known
        learning: [Number]  // Indices of cards still learning
    },
    lastStudied: Date,
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index for efficient queries
examPrepSchema.index({ userId: 1, examId: 1 }, { unique: true });
examPrepSchema.index({ userId: 1, moduleCode: 1 });
examPrepSchema.index({ userId: 1, examDate: 1 });

module.exports = mongoose.model('ExamPrep', examPrepSchema);
