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

router.post("/recommendations", upload.single("cv"), uploadAndAnalyzeCV);
router.get("/recommendations/history", protect, getCVAnalysisHistory);
router.get("/recommendations/:id", protect, getCVAnalysisById);
router.post("/recommendations/search", protect, searchJobs);
router.get("/recommendations/search/history", protect, getJobSearchHistory);
router.post("/recommendations/save", protect, saveJob);

module.exports = router;
