const express = require('express');
const router = express.Router();
const {
    startSession,
    endSession
} = require('../../controllers/masss/sessionController');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.post('/start', startSession); // POST /sessions/start
router.post('/:id/end', endSession); // POST /sessions/{session_id}/end

module.exports = router;