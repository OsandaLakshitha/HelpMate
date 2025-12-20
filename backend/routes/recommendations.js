const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadAndAnalyzeCV,
  getCVAnalysisHistory,
  getCVAnalysisById,
  searchJobs,
  getJobSearchHistory,
  saveJob,
} = require("../controllers/jobRecommendationController");

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Import auth middleware (adjust path as needed)
const { protect } = require("../middleware/auth");

// Routes

/**
 * @route   POST /api/recommendations
 * @desc    Upload CV and get job recommendations
 * @access  Public/Protected (depends on your auth setup)
 */
router.post("/recommendations", upload.single("cv"), uploadAndAnalyzeCV);

/**
 * @route   GET /api/recommendations/history
 * @desc    Get user's CV analysis history
 * @access  Protected
 */
router.get("/recommendations/history", protect, getCVAnalysisHistory);

/**
 * @route   GET /api/recommendations/:id
 * @desc    Get specific CV analysis by ID
 * @access  Protected
 */
router.get("/recommendations/:id", protect, getCVAnalysisById);

/**
 * @route   POST /api/recommendations/search
 * @desc    Manual job search with keywords
 * @access  Protected
 */
router.post("/recommendations/search", protect, searchJobs);

/**
 * @route   GET /api/recommendations/search/history
 * @desc    Get job search history
 * @access  Protected
 */
router.get("/recommendations/search/history", protect, getJobSearchHistory);

/**
 * @route   POST /api/recommendations/save
 * @desc    Save/bookmark a job
 * @access  Protected
 */
router.post("/recommendations/save", protect, saveJob);

module.exports = router;
