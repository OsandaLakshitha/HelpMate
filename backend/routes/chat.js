const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getChatHistory, sendMessage } = require("../controllers/chatController");

// Get chat history with a specific connected peer
router.get("/history/:friendId", protect, getChatHistory);

// Send a message to a specific connected peer
router.post("/send/:friendId", protect, sendMessage);

module.exports = router;
