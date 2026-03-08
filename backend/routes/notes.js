// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Note = require('../models/Note');
const { extractTextFromPdf } = require('../utils/pdfUtils');
const { generateMCQs } = require('../ai/generator');
const { generateShortNotes, generateBasicShortNotes } = require('../utils/summaryGenerator');
const { generateFlashCards } = require('../utils/flashCardGenerator');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = `${req.user._id}-${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// ============== UPLOAD NOTE ==============
router.post('/upload', protect, upload.single('lectureNote'), async (req, res) => {
    try {
        console.log(`\n📄 ========== UPLOAD REQUEST ==========`);
        console.log(`User: ${req.user.email}`);
        
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        
        // Parse tags
        let tags = [];
        try {
            tags = req.body.tags ? JSON.parse(req.body.tags) : [];
        } catch (e) {
            tags = [];
        }
        
        const moduleCode = req.body.moduleCode || '';
        const moduleName = req.body.moduleName || '';
        const numQuestions = parseInt(req.body.numQuestions) || 20;
        const numFlashCards = parseInt(req.body.numFlashCards) || 15;
        
        console.log(`📄 File: ${fileName}`);
        console.log(`🏷️ Module: ${moduleCode} - ${moduleName}`);
        console.log(`📝 Requested: ${numQuestions} MCQs, ${numFlashCards} Flashcards`);
        
        // Extract text
        let extractedText;
        try {
            extractedText = await extractTextFromPdf(filePath);
        } catch (pdfError) {
            console.error('❌ PDF extraction error:', pdfError.message);
            return res.status(400).json({ success: false, error: 'Could not read PDF file.' });
        }

        if (!extractedText || extractedText.trim().length < 100) {
            return res.status(400).json({ success: false, error: 'PDF has insufficient text content.' });
        }

        const wordCount = extractedText.split(/\s+/).length;
        console.log(`📝 Extracted ${wordCount} words`);

        // Generate all content in parallel for speed
        console.log('\n🚀 Starting AI content generation...\n');
        
        const [mcqs, flashCards, shortNotes] = await Promise.all([
            // Generate MCQs
            generateMCQs(extractedText, numQuestions).catch(err => {
                console.error('❌ MCQ generation error:', err.message);
                return [];
            }),
            
            // Generate Flash Cards
            generateFlashCards(extractedText, numFlashCards).catch(err => {
                console.error('❌ Flashcard generation error:', err.message);
                return [];
            }),
            
            // Generate Short Notes (AI Summaries)
            generateShortNotes(extractedText, 10).catch(err => {
                console.error('❌ Summary generation error:', err.message);
                return generateBasicShortNotes(extractedText);
            })
        ]);

        console.log(`\n📊 ========== GENERATION RESULTS ==========`);
        console.log(`✅ MCQs: ${mcqs.length}`);
        console.log(`✅ Flashcards: ${flashCards.length}`);
        console.log(`✅ Short Notes: ${shortNotes.totalPoints} points (AI: ${shortNotes.aiGenerated ? 'Yes' : 'No'})`);

        // Save to MongoDB
        const note = new Note({
            userId: req.user._id,
            fileName,
            filePath,
            moduleCode,
            moduleName,
            tags,
            contentPreview: extractedText.substring(0, 300) + '...',
            fullText: extractedText,
            wordCount,
            mcqs,
            shortNotes,
            flashCards,
            stats: {
                mcqCount: mcqs.length,
                shortNotePoints: shortNotes.totalPoints,
                flashCardCount: flashCards.length
            }
        });

        await note.save();
        console.log(`💾 Note saved: ${note._id}`);
        console.log(`📄 ========== UPLOAD COMPLETE ==========\n`);

        res.json({
            success: true,
            message: 'Lecture note processed successfully',
            note: {
                id: note._id,
                fileName: note.fileName,
                uploadedAt: note.createdAt,
                moduleCode: note.moduleCode,
                moduleName: note.moduleName,
                tags: note.tags,
                contentPreview: note.contentPreview,
                wordCount: note.wordCount,
                stats: note.stats
            },
            mcqs,
            shortNotes,
            flashCards
        });
    } catch (err) {
        console.error('❌ Upload error:', err);
        res.status(500).json({ success: false, error: err.message || 'Failed to process file' });
    }
});

// ============== GET ALL USER'S NOTES ==============
router.get('/list', protect, async (req, res) => {
    try {
        const { moduleCode, tag, search } = req.query;
        
        const query = { userId: req.user._id };
        
        if (moduleCode) {
            query.moduleCode = new RegExp(moduleCode, 'i');
        }
        
        if (tag) {
            query.tags = tag;
        }
        
        if (search) {
            query.$or = [
                { fileName: new RegExp(search, 'i') },
                { moduleName: new RegExp(search, 'i') },
                { moduleCode: new RegExp(search, 'i') }
            ];
        }
        
        const notes = await Note.find(query)
            .select('-fullText -mcqs -shortNotes -flashCards')
            .sort({ createdAt: -1 })
            .lean();
        
        res.json({ 
            success: true,
            notes: notes.map(n => ({
                id: n._id,
                fileName: n.fileName,
                uploadedAt: n.createdAt,
                moduleCode: n.moduleCode,
                moduleName: n.moduleName,
                tags: n.tags || [],
                contentPreview: n.contentPreview,
                wordCount: n.wordCount,
                stats: n.stats,
                isFavorite: n.isFavorite,
                quizAttempts: n.quizAttempts?.length || 0,
                bestScore: n.quizAttempts?.length > 0 
                    ? Math.max(...n.quizAttempts.map(a => a.percentage))
                    : null
            })),
            total: notes.length 
        });
    } catch (err) {
        console.error('List error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch notes' });
    }
});

// ============== GET SINGLE NOTE ==============
router.get('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        res.json({ success: true, note });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch note' });
    }
});

// ============== SAVE QUIZ ATTEMPT ==============
router.post('/:id/quiz-attempt', protect, async (req, res) => {
    try {
        const { score, totalQuestions } = req.body;
        
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        note.quizAttempts.push({
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100)
        });
        
        await note.save();
        
        res.json({ success: true, message: 'Quiz attempt saved' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to save quiz attempt' });
    }
});

// ============== TOGGLE FAVORITE ==============
router.patch('/:id/favorite', protect, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        note.isFavorite = !note.isFavorite;
        await note.save();
        
        res.json({ success: true, isFavorite: note.isFavorite });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update favorite' });
    }
});

// ============== DELETE NOTE ==============
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        // Delete file
        if (note.filePath && fs.existsSync(note.filePath)) {
            fs.unlinkSync(note.filePath);
        }
        
        res.json({ success: true, message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete note' });
    }
});

// ============== REGENERATE ALL ==============
router.post('/:id/regenerate-all', protect, async (req, res) => {
    try {
        console.log('\n🔄 ========== REGENERATE ALL ==========');
        
        const { numQuestions = 20, numFlashCards = 15 } = req.body;
        
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        if (!note.fullText) {
            return res.status(400).json({ success: false, error: 'No text content found' });
        }

        console.log(`📄 Note: ${note.fileName}`);
        console.log(`📝 Generating: ${numQuestions} MCQs, ${numFlashCards} Flashcards`);

        // Generate all content in parallel
        const [mcqs, flashCards, shortNotes] = await Promise.all([
            generateMCQs(note.fullText, numQuestions).catch(err => {
                console.error('MCQ error:', err.message);
                return note.mcqs || [];
            }),
            generateFlashCards(note.fullText, numFlashCards).catch(err => {
                console.error('Flashcard error:', err.message);
                return note.flashCards || [];
            }),
            generateShortNotes(note.fullText, 10).catch(err => {
                console.error('Summary error:', err.message);
                return generateBasicShortNotes(note.fullText);
            })
        ]);
        
        // Update note
        note.mcqs = mcqs;
        note.flashCards = flashCards;
        note.shortNotes = shortNotes;
        note.stats = {
            mcqCount: mcqs.length,
            shortNotePoints: shortNotes.totalPoints,
            flashCardCount: flashCards.length
        };
        
        await note.save();

        console.log(`✅ Regenerated: ${mcqs.length} MCQs, ${flashCards.length} Flashcards, ${shortNotes.totalPoints} Notes`);
        console.log('🔄 ========== REGENERATE COMPLETE ==========\n');
        
        res.json({
            success: true,
            mcqs,
            flashCards,
            shortNotes,
            stats: note.stats
        });
    } catch (err) {
        console.error('Regenerate error:', err);
        res.status(500).json({ success: false, error: 'Failed to regenerate content' });
    }
});

// ============== REGENERATE MCQs ONLY ==============
router.post('/:id/regenerate-mcqs', protect, async (req, res) => {
    try {
        const { numQuestions = 20 } = req.body;
        
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        if (!note.fullText) {
            return res.status(400).json({ success: false, error: 'No text content found' });
        }

        console.log(`🔄 Regenerating MCQs for: ${note.fileName}`);
        
        const mcqs = await generateMCQs(note.fullText, numQuestions);
        
        note.mcqs = mcqs;
        note.stats.mcqCount = mcqs.length;
        await note.save();

        console.log(`✅ Regenerated ${mcqs.length} MCQs`);
        
        res.json({ success: true, mcqs, count: mcqs.length });
    } catch (err) {
        console.error('Regenerate MCQs error:', err);
        res.status(500).json({ success: false, error: 'Failed to regenerate MCQs' });
    }
});

// ============== REGENERATE FLASHCARDS ONLY ==============
router.post('/:id/regenerate-flashcards', protect, async (req, res) => {
    try {
        const { numFlashCards = 15 } = req.body;
        
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        if (!note.fullText) {
            return res.status(400).json({ success: false, error: 'No text content found' });
        }

        console.log(`🔄 Regenerating Flashcards for: ${note.fileName}`);
        
        const flashCards = await generateFlashCards(note.fullText, numFlashCards);
        
        note.flashCards = flashCards;
        note.stats.flashCardCount = flashCards.length;
        await note.save();

        console.log(`✅ Regenerated ${flashCards.length} Flashcards`);
        
        res.json({ success: true, flashCards, count: flashCards.length });
    } catch (err) {
        console.error('Regenerate Flashcards error:', err);
        res.status(500).json({ success: false, error: 'Failed to regenerate flashcards' });
    }
});

// ============== REGENERATE SHORT NOTES ONLY ==============
router.post('/:id/regenerate-notes', protect, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        if (!note.fullText) {
            return res.status(400).json({ success: false, error: 'No text content found' });
        }

        console.log(`🔄 Regenerating Short Notes for: ${note.fileName}`);
        
        const shortNotes = await generateShortNotes(note.fullText, 10);
        
        note.shortNotes = shortNotes;
        note.stats.shortNotePoints = shortNotes.totalPoints;
        await note.save();

        console.log(`✅ Regenerated ${shortNotes.totalPoints} Short Note points`);
        
        res.json({ success: true, shortNotes, totalPoints: shortNotes.totalPoints });
    } catch (err) {
        console.error('Regenerate Short Notes error:', err);
        res.status(500).json({ success: false, error: 'Failed to regenerate short notes' });
    }
});

// ============== GET USER'S TAGS & MODULES ==============
router.get('/meta/tags', protect, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id })
            .select('tags moduleCode moduleName')
            .lean();
        
        const allTags = new Set();
        const allModules = new Map();
        
        notes.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => allTags.add(tag));
            }
            if (note.moduleCode) {
                allModules.set(note.moduleCode, note.moduleName || '');
            }
        });
        
        res.json({
            success: true,
            tags: Array.from(allTags).sort(),
            modules: Array.from(allModules.entries())
                .map(([code, name]) => ({ code, name }))
                .sort((a, b) => a.code.localeCompare(b.code))
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch metadata' });
    }
});

// ============== GET USER STATS ==============
router.get('/meta/stats', protect, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id }).lean();
        
        let totalScore = 0;
        let totalAttempts = 0;
        
        notes.forEach(n => {
            if (n.quizAttempts) {
                n.quizAttempts.forEach(a => {
                    totalScore += a.percentage || 0;
                    totalAttempts++;
                });
            }
        });
        
        const stats = {
            totalNotes: notes.length,
            totalMCQs: notes.reduce((sum, n) => sum + (n.stats?.mcqCount || 0), 0),
            totalFlashCards: notes.reduce((sum, n) => sum + (n.stats?.flashCardCount || 0), 0),
            totalQuizAttempts: totalAttempts,
            averageScore: totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0
        };
        
        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

// ============== DASHBOARD STATS ==============
router.get('/dashboard/stats', protect, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id }).lean();
        
        let totalScore = 0;
        let totalAttempts = 0;
        
        notes.forEach(n => {
            if (n.quizAttempts) {
                n.quizAttempts.forEach(a => {
                    totalScore += a.percentage || 0;
                    totalAttempts++;
                });
            }
        });
        
        // Get recent notes
        const recentNotes = notes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(n => ({
                id: n._id,
                fileName: n.fileName,
                moduleCode: n.moduleCode,
                uploadedAt: n.createdAt,
                stats: n.stats
            }));
        
        res.json({
            success: true,
            stats: {
                totalNotes: notes.length,
                totalMCQs: notes.reduce((sum, n) => sum + (n.stats?.mcqCount || 0), 0),
                totalFlashCards: notes.reduce((sum, n) => sum + (n.stats?.flashCardCount || 0), 0),
                totalQuizAttempts: totalAttempts,
                averageScore: totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0
            },
            recentNotes
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;
