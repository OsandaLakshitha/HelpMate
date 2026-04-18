const express     = require('express')
const router      = express.Router()
const { protect } = require('../../middleware/auth')
const ctrl        = require('../../controllers/masss/statsController')

router.use(protect)

/**
 * @swagger
 * /api/masss/stats/dashboard-summary:
 *   get:
 *     summary: Get dashboard summary stats for the current user
 *     description: >
 *       Returns streak, sessions today, recent focus ratings (for the heartbeat chart),
 *       best focus this week, and last task name. All calculated from session history.
 *     tags: [MASSS - Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
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
 *                     recent_ratings:
 *                       type: array
 *                       description: Last 7 focus ratings oldest→newest (for heartbeat chart)
 *                       items:
 *                         type: number
 *                       example: [3.0, 4.0, 3.5, 5.0, 4.0, 3.0, 4.5]
 *                     last_task_name:
 *                       type: string
 *                       example: Complete Chapter 5
 *                     streak_days:
 *                       type: integer
 *                       description: Consecutive days with at least one completed session
 *                       example: 5
 *                     best_focus_week:
 *                       type: number
 *                       description: Highest focus rating in the last 7 days
 *                       example: 5.0
 *                     sessions_today:
 *                       type: integer
 *                       example: 3
 *                     recent_avg_focus:
 *                       type: number
 *                       example: 3.86
 *       401:
 *         description: Unauthorized
 */
router.get('/stats/dashboard-summary', ctrl.getDashboardSummary)

/**
 * @swagger
 * /api/masss/stats/health:
 *   get:
 *     summary: Get system health status including RL service connectivity
 *     description: >
 *       Checks if the main Node API is running and pings the RL microservice.
 *       Useful for debugging and monitoring from the frontend.
 *     tags: [MASSS - Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health status of all services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 main_api:
 *                   type: string
 *                   example: ok
 *                 rl_service:
 *                   type: string
 *                   enum: [ok, unreachable]
 *                   example: ok
 *                 rl_model_loaded:
 *                   type: boolean
 *                   description: Whether the PPO model is loaded in the RL service
 *                   example: true
 *       401:
 *         description: Unauthorized
 */
router.get('/stats/health', ctrl.getHealth)

/**
 * @swagger
 * /api/masss/rl/state-vector:
 *   get:
 *     summary: Get the RL cognitive state vector for the dashboard
 *     description: >
 *       Proxies to the RL microservice. Returns cognitive fatigue, energy battery,
 *       slot fatigue, workload intensity, focus history, and slot labels.
 *       Used by the AI Insights page and dashboard cards.
 *     tags: [MASSS - RL & Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active_slot
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *           default: morning
 *         description: The slot to calculate cognitive state for
 *     responses:
 *       200:
 *         description: RL state vector from the microservice
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
 *                   description: >
 *                     Full state vector — see RL service docs for schema.
 *                     Returns empty object if RL service is unreachable.
 *                   properties:
 *                     cognitive_fatigue:
 *                       type: number
 *                       example: 0.42
 *                     cognitive_label:
 *                       type: string
 *                       enum: [FRESH, FATIGUING, BURNOUT RISK]
 *                       example: FRESH
 *                     workload_intensity:
 *                       type: number
 *                       example: 0.65
 *                     slot_labels:
 *                       type: object
 *                       example: { morning: "Morning Focus", afternoon: "Afternoon", evening: "Night Grind" }
 *                     energy_battery:
 *                       type: object
 *                     slot_fatigue:
 *                       type: object
 *                     focus_history:
 *                       type: array
 *       400:
 *         description: Invalid active_slot value
 *       401:
 *         description: Unauthorized
 */
router.get('/rl/state-vector', ctrl.getStateVector)

/**
 * @swagger
 * /api/masss/schedule/rl:
 *   get:
 *     summary: Get AI-generated schedule from the RL service
 *     description: >
 *       Proxies all user data to the RL microservice and returns a day schedule.
 *       If the RL service is unreachable, returns a graceful fallback with an error field.
 *       The response shape is always morning/afternoon/evening slot arrays.
 *     tags: [MASSS - RL & Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active_slot
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *           default: morning
 *         description: Current active slot — used by RL service for context
 *     responses:
 *       200:
 *         description: RL-generated schedule
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
 *                     morning:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           task_id:
 *                             type: string
 *                           task_name:
 *                             type: string
 *                           slot:
 *                             type: string
 *                           allocation_type:
 *                             type: string
 *                             enum: [rl_decision, priority_fallback, sticky_rule]
 *                     afternoon:
 *                       type: array
 *                     evening:
 *                       type: array
 *                     strategy_used:
 *                       type: string
 *                       enum: [rl_ppo, priority_fallback, unavailable]
 *                       example: rl_ppo
 *                     work_intensity:
 *                       type: number
 *                       example: 0.72
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       description: Present only when RL service is unavailable
 *                       example: "RL service unavailable"
 *       401:
 *         description: Unauthorized
 */
router.get('/schedule/rl', ctrl.getRLSchedule)

/**
 * @swagger
 * /api/masss/schedule/heuristic:
 *   get:
 *     summary: Get rule-based heuristic schedule
 *     description: >
 *       Generates a schedule using a greedy priority-scoring algorithm.
 *       Always available — no RL model required.
 *       Fixed tasks are scheduled first, then floating tasks sorted by
 *       priority × deadline urgency × exam weight score.
 *     tags: [MASSS - RL & Schedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Heuristic schedule
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
 *                     morning:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           task_id:
 *                             type: string
 *                           task_name:
 *                             type: string
 *                           module:
 *                             type: string
 *                           assigned_sessions:
 *                             type: integer
 *                           priority:
 *                             type: string
 *                           status:
 *                             type: string
 *                           allocation_type:
 *                             type: string
 *                             enum: [fixed, auto]
 *                     afternoon:
 *                       type: array
 *                     evening:
 *                       type: array
 *                     strategy_used:
 *                       type: string
 *                       example: "Heuristic (Baseline)"
 *       401:
 *         description: Unauthorized
 */
router.get('/schedule/heuristic', ctrl.getHeuristicSchedule)

module.exports = router