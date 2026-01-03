const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getPeerMatches,
  getProfile,
  getUserProfile,
  getAllUsers,
  sendConnectionRequest,
  getSentConnectionRequests,
  getReceivedConnectionRequests,
  acceptConnectionRequest,
  declineConnectionRequest,
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

// @route   POST /api/peer-matching/connect
router.post("/connect", sendConnectionRequest);

// @route   GET /api/peer-matching/sent-requests
router.get("/sent-requests", getSentConnectionRequests);

// @route   GET /api/peer-matching/received-requests
router.get("/received-requests", getReceivedConnectionRequests);

// @route   PUT /api/peer-matching/requests/:requestId/accept
router.put("/requests/:requestId/accept", acceptConnectionRequest);

// @route   PUT /api/peer-matching/requests/:requestId/decline
router.put("/requests/:requestId/decline", declineConnectionRequest);

module.exports = router;
