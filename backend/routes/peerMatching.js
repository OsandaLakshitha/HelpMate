const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getPeerMatches,
  getProfile,
  getUserProfile,
  getAllUsers,
} = require("../controllers/peerMatchingController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @route   GET /api/peer-matching/profile

router.get("/profile", getProfile);

// @route   PUT /api/peer-matching/profile

router.put("/profile", updateProfile);

// @route   GET /api/peer-matching/matches

router.get("/matches", getPeerMatches);

// @route   GET /api/peer-matching/users

router.get("/users", getAllUsers);

router.get("/users/:userId", getUserProfile);

module.exports = router;
