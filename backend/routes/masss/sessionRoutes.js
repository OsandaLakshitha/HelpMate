const express = require('express');
const router = express.Router();
const {
    startSession,
    endSession
} = require('../../controllers/masss/sessionController');
const { protect } = require('../../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/masss/sessions/start:
 *   post:
 *     summary: Start a pomodoro session
 *     tags: [MASSS Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [task_id]
 *             properties:
 *               task_id:
 *                 type: string
 *           example:
 *             task_id: 65f000000000000000000001
 *     responses:
 *       201:
 *         description: Session started
 */
router.post('/start', startSession);

/**
 * @swagger
 * /api/masss/sessions/{id}/end:
 *   post:
 *     summary: End a pomodoro session
 *     tags: [MASSS Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               end_type:
 *                 type: string
 *                 enum: [completed, stopped, aborted, skipped]
 *               focus_rating:
 *                 type: number
 *           example:
 *             end_type: completed
 *             focus_rating: 4
 *     responses:
 *       200:
 *         description: Session ended
 */
router.post('/:id/end', endSession);

module.exports = router;