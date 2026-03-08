// backend/routes/examPrep.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Note = require('../models/Note');
const User = require('../models/User');
const ExamPrep = require('../models/ExamPrep');
const { generateMCQs } = require('../ai/generator');
const { generateFlashCards } = require('../utils/flashCardGenerator');
const { generateShortNotes } = require('../utils/shortNotes');

// ============== GET ALL EXAM PREPS ==============
router.get('/', protect, async (req, res) => {
    try {
        const examPreps = await ExamPrep.find({ userId: req.user._id })
            .sort({ examDate: 1 })
            .lean();
        
        res.json({
            success: true,
            examPreps
        });
    } catch (err) {
        console.error('Get exam preps error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch exam preps' });
    }
});

// ============== GET SINGLE EXAM PREP ==============
router.get('/:id', protect, async (req, res) => {
    try {
        const examPrep = await ExamPrep.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).lean();
        
        if (!examPrep) {
            return res.status(404).json({ success: false, error: 'Exam prep not found' });
        }
        
        res.json({
            success: true,
            examPrep
        });
    } catch (err) {
        console.error('Get exam prep error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch exam prep' });
    }
});

// ============== CREATE EXAM PREP (Manual) ==============
router.post('/create', protect, async (req, res) => {
    try {
        const { moduleCode, examTitle, examDate, noteIds } = req.body;
        
        if (!moduleCode && (!noteIds || noteIds.length === 0)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide a module code or select notes' 
            });
        }
        
        console.log(`\n📚 Creating Exam Prep for ${moduleCode || 'selected notes'}...`);
        
        // Find related notes
        let notes;
        if (noteIds && noteIds.length > 0) {
            notes = await Note.find({
                _id: { $in: noteIds },
                userId: req.user._id
            }).lean();
        } else {
            notes = await Note.find({
                userId: req.user._id,
                moduleCode: new RegExp(`^${moduleCode}$`, 'i')
            }).lean();
        }
        
        if (notes.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'No notes found for this module/selection' 
            });
        }
        
        console.log(`📄 Found ${notes.length} related notes`);
        
        // Combine all content from notes
        const combinedText = notes.map(n => n.fullText).join('\n\n');
        
        // Combine existing MCQs (limit to 50)
        let combinedMcqs = notes.flatMap(n => n.mcqs || []);
        
        // Generate additional MCQs if needed
        if (combinedMcqs.length < 30) {
            console.log('📝 Generating additional MCQs...');
            try {
                const newMcqs = await generateMCQs(combinedText, 30 - combinedMcqs.length);
                combinedMcqs = [...combinedMcqs, ...newMcqs];
            } catch (err) {
                console.error('MCQ generation error:', err.message);
            }
        }
        
        // Shuffle and limit MCQs
        combinedMcqs = combinedMcqs
            .sort(() => Math.random() - 0.5)
            .slice(0, 50);
        
        // Combine existing flashcards (limit to 40)
        let combinedFlashcards = notes.flatMap(n => n.flashCards || []);
        
        // Generate additional flashcards if needed
        if (combinedFlashcards.length < 20) {
            console.log('🎴 Generating additional flashcards...');
            try {
                const newFlashcards = await generateFlashCards(combinedText, 20 - combinedFlashcards.length);
                combinedFlashcards = [...combinedFlashcards, ...newFlashcards];
            } catch (err) {
                console.error('Flashcard generation error:', err.message);
            }
        }
        
        // Shuffle and limit flashcards
        combinedFlashcards = combinedFlashcards
            .sort(() => Math.random() - 0.5)
            .slice(0, 40);
        
        // Combine short notes
        const combinedShortNotes = {
            summary: notes.map(n => n.shortNotes?.summary || '').filter(Boolean).join(' ').substring(0, 1000),
            sections: [],
            totalPoints: 0
        };
        
        // Merge sections by type
        const sectionsByType = {};
        notes.forEach(note => {
            (note.shortNotes?.sections || []).forEach(section => {
                if (!sectionsByType[section.type]) {
                    sectionsByType[section.type] = {
                        title: section.title,
                        type: section.type,
                        items: []
                    };
                }
                sectionsByType[section.type].items.push(...(section.items || []));
            });
        });
        
        // Limit items per section
        Object.values(sectionsByType).forEach(section => {
            section.items = [...new Set(section.items)].slice(0, 20); // Unique items, max 20
            combinedShortNotes.sections.push(section);
            combinedShortNotes.totalPoints += section.items.length;
        });
        
        // Create exam prep document
        const examPrep = new ExamPrep({
            userId: req.user._id,
            moduleCode: moduleCode || notes[0].moduleCode,
            moduleName: notes[0].moduleName || '',
            examTitle: examTitle || `${moduleCode || notes[0].moduleCode} Exam Prep`,
            examDate: examDate || null,
            sourceNotes: notes.map(n => ({
                noteId: n._id,
                fileName: n.fileName
            })),
            mcqs: combinedMcqs,
            flashCards: combinedFlashcards,
            shortNotes: combinedShortNotes,
            stats: {
                totalMcqs: combinedMcqs.length,
                totalFlashcards: combinedFlashcards.length,
                totalKeyPoints: combinedShortNotes.totalPoints,
                sourceNotesCount: notes.length
            }
        });
        
        await examPrep.save();
        
        // Update user's detected exam if this is from calendar
        if (req.body.eventId) {
            await User.updateOne(
                { 
                    _id: req.user._id,
                    'detectedExams.eventId': req.body.eventId
                },
                {
                    $set: {
                        'detectedExams.$.prepGenerated': true,
                        'detectedExams.$.examPrepId': examPrep._id
                    }
                }
            );
        }
        
        console.log(`✅ Exam prep created: ${examPrep._id}`);
        console.log(`   MCQs: ${combinedMcqs.length}, Flashcards: ${combinedFlashcards.length}\n`);
        
        res.json({
            success: true,
            message: 'Exam prep created successfully',
            examPrep: {
                id: examPrep._id,
                moduleCode: examPrep.moduleCode,
                examTitle: examPrep.examTitle,
                examDate: examPrep.examDate,
                stats: examPrep.stats
            }
        });
    } catch (err) {
        console.error('Create exam prep error:', err);
        res.status(500).json({ success: false, error: 'Failed to create exam prep' });
    }
});

// ============== CREATE EXAM PREP FROM CALENDAR EVENT ==============
router.post('/from-calendar', protect, async (req, res) => {
    try {
        const { eventId, moduleCode, examTitle, examDate } = req.body;
        
        if (!moduleCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Module code is required' 
            });
        }
        
        // Check if prep already exists for this event
        const existing = await ExamPrep.findOne({
            userId: req.user._id,
            'sourceNotes.eventId': eventId
        });
        
        if (existing) {
            return res.json({
                success: true,
                message: 'Exam prep already exists',
                examPrep: existing
            });
        }
        
        // Use the create endpoint logic
        req.body.noteIds = null; // Will search by moduleCode
        
        // Forward to create endpoint
        const createRes = await createExamPrepInternal(req.user._id, {
            moduleCode,
            examTitle,
            examDate,
            eventId
        });
        
        res.json(createRes);
    } catch (err) {
        console.error('Create from calendar error:', err);
        res.status(500).json({ success: false, error: 'Failed to create exam prep' });
    }
});

// ============== SAVE QUIZ ATTEMPT ==============
router.post('/:id/quiz-attempt', protect, async (req, res) => {
    try {
        const { score, totalQuestions, timeSpent } = req.body;
        
        const examPrep = await ExamPrep.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!examPrep) {
            return res.status(404).json({ success: false, error: 'Exam prep not found' });
        }
        
        const percentage = Math.round((score / totalQuestions) * 100);
        
        examPrep.quizAttempts.push({
            score,
            totalQuestions,
            percentage,
            timeSpent: timeSpent || 0
        });
        
        // Update progress
        examPrep.progress.mcqsAttempted = Math.min(
            examPrep.stats.totalMcqs,
            (examPrep.progress.mcqsAttempted || 0) + totalQuestions
        );
        examPrep.progress.lastStudied = new Date();
        
        // Calculate completion percentage
        const mcqProgress = (examPrep.progress.mcqsAttempted / examPrep.stats.totalMcqs) * 50;
        const flashcardProgress = ((examPrep.progress.flashcardsReviewed || 0) / examPrep.stats.totalFlashcards) * 50;
        examPrep.progress.completionPercentage = Math.min(100, Math.round(mcqProgress + flashcardProgress));
        
        await examPrep.save();
        
        // Update user stats
        await User.updateOne(
            { _id: req.user._id },
            {
                $inc: {
                    'studyStats.totalMcqsAttempted': totalQuestions,
                    'studyStats.totalMcqsCorrect': score,
                    'studyStats.totalQuizzesTaken': 1
                }
            }
        );
        
        res.json({
            success: true,
            message: 'Quiz attempt saved',
            percentage,
            progress: examPrep.progress
        });
    } catch (err) {
        console.error('Save quiz attempt error:', err);
        res.status(500).json({ success: false, error: 'Failed to save quiz attempt' });
    }
});

// ============== UPDATE FLASHCARD PROGRESS ==============
router.post('/:id/flashcard-progress', protect, async (req, res) => {
    try {
        const { reviewed, known } = req.body;
        
        const examPrep = await ExamPrep.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!examPrep) {
            return res.status(404).json({ success: false, error: 'Exam prep not found' });
        }
        
        examPrep.progress.flashcardsReviewed = Math.min(
            examPrep.stats.totalFlashcards,
            reviewed || examPrep.progress.flashcardsReviewed
        );
        examPrep.progress.flashcardsKnown = known || examPrep.progress.flashcardsKnown;
        examPrep.progress.lastStudied = new Date();
        
        // Calculate completion percentage
        const mcqProgress = ((examPrep.progress.mcqsAttempted || 0) / examPrep.stats.totalMcqs) * 50;
        const flashcardProgress = (examPrep.progress.flashcardsReviewed / examPrep.stats.totalFlashcards) * 50;
        examPrep.progress.completionPercentage = Math.min(100, Math.round(mcqProgress + flashcardProgress));
        
        await examPrep.save();
        
        // Update user stats
        await User.updateOne(
            { _id: req.user._id },
            {
                $inc: {
                    'studyStats.totalFlashcardsReviewed': reviewed - (examPrep.progress.flashcardsReviewed || 0)
                }
            }
        );
        
        res.json({
            success: true,
            message: 'Flashcard progress saved',
            progress: examPrep.progress
        });
    } catch (err) {
        console.error('Save flashcard progress error:', err);
        res.status(500).json({ success: false, error: 'Failed to save progress' });
    }
});

// ============== DELETE EXAM PREP ==============
router.delete('/:id', protect, async (req, res) => {
    try {
        const examPrep = await ExamPrep.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!examPrep) {
            return res.status(404).json({ success: false, error: 'Exam prep not found' });
        }
        
        res.json({
            success: true,
            message: 'Exam prep deleted'
        });
    } catch (err) {
        console.error('Delete exam prep error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete exam prep' });
    }
});

// ============== REGENERATE EXAM PREP CONTENT ==============
router.post('/:id/regenerate', protect, async (req, res) => {
    try {
        const { type } = req.body; // 'mcqs', 'flashcards', or 'all'
        
        const examPrep = await ExamPrep.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!examPrep) {
            return res.status(404).json({ success: false, error: 'Exam prep not found' });
        }
        
        // Get source notes
        const noteIds = examPrep.sourceNotes.map(n => n.noteId);
        const notes = await Note.find({
            _id: { $in: noteIds }
        }).lean();
        
        const combinedText = notes.map(n => n.fullText).join('\n\n');
        
        if (type === 'mcqs' || type === 'all') {
            console.log('📝 Regenerating MCQs...');
            const newMcqs = await generateMCQs(combinedText, 50);
            examPrep.mcqs = newMcqs;
            examPrep.stats.totalMcqs = newMcqs.length;
        }
        
        if (type === 'flashcards' || type === 'all') {
            console.log('🎴 Regenerating flashcards...');
            const newFlashcards = await generateFlashCards(combinedText, 40);
            examPrep.flashCards = newFlashcards;
            examPrep.stats.totalFlashcards = newFlashcards.length;
        }
        
        await examPrep.save();
        
        res.json({
            success: true,
            message: 'Content regenerated',
            stats: examPrep.stats
        });
    } catch (err) {
        console.error('Regenerate error:', err);
        res.status(500).json({ success: false, error: 'Failed to regenerate content' });
    }
});

// Internal helper function
async function createExamPrepInternal(userId, { moduleCode, examTitle, examDate, eventId }) {
    const notes = await Note.find({
        userId,
        moduleCode: new RegExp(`^${moduleCode}$`, 'i')
    }).lean();
    
    if (notes.length === 0) {
        return { success: false, error: 'No notes found for this module' };
    }
    
    const combinedText = notes.map(n => n.fullText).join('\n\n');
    
    // Combine and generate content
    let combinedMcqs = notes.flatMap(n => n.mcqs || []).slice(0, 50);
    let combinedFlashcards = notes.flatMap(n => n.flashCards || []).slice(0, 40);
    
    const examPrep = new ExamPrep({
        userId,
        moduleCode,
        moduleName: notes[0].moduleName || '',
        examTitle: examTitle || `${moduleCode} Exam Prep`,
        examDate: examDate || null,
        sourceNotes: notes.map(n => ({
            noteId: n._id,
            fileName: n.fileName,
            eventId
        })),
        mcqs: combinedMcqs,
        flashCards: combinedFlashcards,
        shortNotes: {
            summary: notes.map(n => n.shortNotes?.summary || '').join(' ').substring(0, 500),
            sections: notes.flatMap(n => n.shortNotes?.sections || []).slice(0, 10),
            totalPoints: notes.reduce((sum, n) => sum + (n.shortNotes?.totalPoints || 0), 0)
        },
        stats: {
            totalMcqs: combinedMcqs.length,
            totalFlashcards: combinedFlashcards.length,
            totalKeyPoints: notes.reduce((sum, n) => sum + (n.shortNotes?.totalPoints || 0), 0),
            sourceNotesCount: notes.length
        }
    });
    
    await examPrep.save();
    
    // Update user's detected exam
    if (eventId) {
        await User.updateOne(
            { userId, 'detectedExams.eventId': eventId },
            {
                $set: {
                    'detectedExams.$.prepGenerated': true,
                    'detectedExams.$.examPrepId': examPrep._id
                }
            }
        );
    }
    
    return {
        success: true,
        examPrep
    };
}

module.exports = router;
