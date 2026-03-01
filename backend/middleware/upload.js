import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// ── PDF upload storage (for assignment briefs) ────────────────────────────────
const pdfDir = 'uploads/pdfs';
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pdfDir),
  filename:    (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
});

const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const pdfUpload = multer({
  storage:  pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB max
});

// handleUpload — used in projectRoutes for PDF assignment brief
// Wraps multer to return JSON errors instead of Express default
export const handleUpload = (req, res, next) => {
  pdfUpload.single('assignmentPdf')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.code === 'LIMIT_FILE_SIZE' ? 'PDF must be under 10MB' : err.message,
      });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

// ── General file upload (existing — for task proof files) ─────────────────────
const generalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = 'uploads/proofs';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

// upload — existing export used in taskRoutes
export const upload = multer({ storage: generalStorage });