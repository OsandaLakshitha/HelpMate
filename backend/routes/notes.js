// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromPdf } = require('../utils/pdfUtils');
const { generateMCQs } = require('../ai/generator');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
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
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// In-memory storage
let uploadedNotes = [];

// POST /api/notes/upload
router.post('/upload', upload.single('lectureNote'), async (req, res) => {
    try {
        console.log('\n📄 Upload request received');
        
        if (!req.file) {
            console.log('❌ No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        
        console.log(`📄 Processing: ${fileName}`);
        console.log(`📂 File path: ${filePath}`);
        
        // Extract text from PDF
        let extractedText;
        try {
            extractedText = await extractTextFromPdf(filePath);
            console.log(`📝 Extracted ${extractedText.split(/\s+/).length} words`);
        } catch (pdfError) {
            console.error('❌ PDF extraction error:', pdfError.message);
            return res.status(400).json({ error: 'Could not read PDF file. Make sure it contains text (not scanned images).' });
        }

        if (!extractedText || extractedText.trim().length < 100) {
            return res.status(400).json({ error: 'Could not extract sufficient text from PDF. The file might be too short or contain only images.' });
        }

        // Generate MCQs
        const numQuestions = parseInt(req.body.numQuestions) || 20;
        
        let mcqs;
        try {
            mcqs = await generateMCQs(extractedText, numQuestions);
        } catch (aiError) {
            console.error('❌ AI generation error:', aiError.message);
            return res.status(500).json({ error: aiError.message || 'Failed to generate MCQs. Is the AI server running?' });
        }

        if (!mcqs || mcqs.length === 0) {
            return res.status(500).json({ 
                error: 'Could not generate MCQs. The AI model might be having issues.' 
            });
        }

        // Store in memory
        const noteEntry = {
            id: Date.now().toString(),
            fileName,
            uploadedAt: new Date().toISOString(),
            contentPreview: extractedText.substring(0, 200) + '...',
            fullText: extractedText,
            mcqs
        };
        uploadedNotes.push(noteEntry);

        console.log(`✅ Returning ${mcqs.length} MCQs to frontend\n`);

        res.json({
            message: 'Lecture note processed successfully',
            note: {
                id: noteEntry.id,
                fileName: noteEntry.fileName,
                uploadedAt: noteEntry.uploadedAt,
                contentPreview: noteEntry.contentPreview
            },
            mcqs,
            stats: {
                totalGenerated: mcqs.length,
                requested: numQuestions
            }
        });
    } catch (err) {
        console.error('❌ Upload error:', err);
        res.status(500).json({ error: err.message || 'Failed to process file' });
    }
});

// GET /api/notes/list
router.get('/list', (req, res) => {
    res.json({ notes: uploadedNotes.map(n => ({
        id: n.id,
        fileName: n.fileName,
        uploadedAt: n.uploadedAt,
        contentPreview: n.contentPreview,
        mcqCount: n.mcqs.length
    })) });
});

module.exports = router;