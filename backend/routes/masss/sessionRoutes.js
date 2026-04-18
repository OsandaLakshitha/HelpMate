const express     = require('express')
const router      = express.Router()
const { protect } = require('../../middleware/auth')
const ctrl        = require('../../controllers/masss/sessionController')

router.use(protect)

/**
 * @swagger
 * /api/masss/sessions/start:
 *   post:
 *     summary: Start a new Pomodoro session for a task
 *     description: >
 *       Creates a session document with startTime = now.
 *       Automatically detects the current study slot from the user's
 *       slot preferences. Sets the linked task status to in_progress.
 *     tags: [MASSS - Sessions]
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
 *                 description: ObjectId of the task to work on
 *                 example: "64abc123def456"
 *           example:
 *             task_id: "64abc123def456"
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     taskId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                     slotType:
 *                       type: string
 *                       enum: [morning, afternoon, evening]
 *                       example: morning
 *                     isCompleted:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: task_id is required or task is already completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Task is already completed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.post('/start', ctrl.start)

/**
 * @swagger
 * /api/masss/sessions/{id}/end:
 *   post:
 *     summary: End an active Pomodoro session
 *     description: >
 *       Calculates duration from startTime to now, saves end_type and focus_rating.
 *       Business rules applied:
 *       - completed → sessionsCount++ on the task; extends estimatedPomodoros if exceeded
 *       - aborted   → if sessionsCount was 0, resets task status back to pending
 *       - stopped   → task remains in_progress
 *     tags: [MASSS - Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ObjectId
 *         example: "64abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [end_type]
 *             properties:
 *               end_type:
 *                 type: string
 *                 enum: [completed, stopped, aborted, skipped]
 *                 description: How the session ended
 *                 example: completed
 *               focus_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 nullable: true
 *                 description: User's self-rated focus score for this session
 *                 example: 4
 *           example:
 *             end_type: completed
 *             focus_rating: 4
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                     durationMinutes:
 *                       type: number
 *                       example: 24.5
 *                     endType:
 *                       type: string
 *                       example: completed
 *                     focusRating:
 *                       type: integer
 *                       example: 4
 *                     isCompleted:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid end_type or session already ended
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Session already ended
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.post('/:id/end', ctrl.end)

/**
 * @swagger
 * /api/masss/sessions:
 *   get:
 *     summary: Get recent Pomodoro sessions for the current user
 *     tags: [MASSS - Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Array of session objects sorted by most recent first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       taskId:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                       endTime:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       durationMinutes:
 *                         type: number
 *                         example: 24.5
 *                       slotType:
 *                         type: string
 *                         enum: [morning, afternoon, evening]
 *                       endType:
 *                         type: string
 *                         enum: [completed, stopped, aborted, skipped]
 *                       focusRating:
 *                         type: integer
 *                         nullable: true
 *                         example: 4
 *       401:
 *         description: Unauthorized
 */
router.get('/', ctrl.getRecent)

module.exports = router