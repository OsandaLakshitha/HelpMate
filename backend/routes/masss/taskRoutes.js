const express     = require('express')
const router      = express.Router()
const { protect } = require('../../middleware/auth')
const ctrl        = require('../../controllers/masss/taskController')

router.use(protect)

/**
 * @swagger
 * /api/masss/tasks:
 *   get:
 *     summary: Get tasks for the current user with optional filters
 *     description: >
 *       Returns all non-archived tasks by default. Use the status filter
 *       to explicitly fetch archived tasks.
 *     tags: [MASSS - Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, archived]
 *         description: Filter by task status. Omit to get all non-archived tasks.
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: string
 *         description: Filter by module ObjectId
 *         example: "64abc123def456"
 *       - in: query
 *         name: exam_id
 *         schema:
 *           type: string
 *         description: Filter by exam ObjectId
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *     responses:
 *       200:
 *         description: Array of task objects
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
 *                       name:
 *                         type: string
 *                         example: Complete Chapter 5
 *                       priority:
 *                         type: string
 *                         enum: [high, medium, low]
 *                       difficulty:
 *                         type: integer
 *                         example: 3
 *                       status:
 *                         type: string
 *                         enum: [pending, in_progress, completed, archived]
 *                       estimatedPomodoros:
 *                         type: integer
 *                         example: 3
 *                       sessionsCount:
 *                         type: integer
 *                         example: 1
 *                       deadline:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 */
router.get('/', ctrl.getAll)

/**
 * @swagger
 * /api/masss/tasks:
 *   post:
 *     summary: Create a new task inside a module
 *     description: >
 *       Verifies the module belongs to the user before creating the task.
 *       Optionally links to an exam.
 *     tags: [MASSS - Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, module_id]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Complete Chapter 5 Problems
 *               description:
 *                 type: string
 *                 example: Focus on integration by parts
 *                 nullable: true
 *               module_id:
 *                 type: string
 *                 example: "64abc123def456"
 *               exam_id:
 *                 type: string
 *                 nullable: true
 *                 example: "64def789abc123"
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 default: medium
 *                 example: high
 *               difficulty:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 3
 *                 example: 4
 *               estimated_pomodoros:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 3
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2025-11-30T23:59:00.000Z"
 *               is_fixed:
 *                 type: boolean
 *                 default: false
 *                 description: Fixed tasks are always scheduled first
 *           example:
 *             name: Complete Chapter 5 Problems
 *             description: Focus on integration by parts
 *             module_id: "64abc123def456"
 *             priority: high
 *             difficulty: 4
 *             estimated_pomodoros: 3
 *             deadline: "2025-11-30T23:59:00.000Z"
 *             is_fixed: false
 *     responses:
 *       201:
 *         description: Task created
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
 *       400:
 *         description: name and module_id are required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Module not found or access denied
 */
router.post('/', ctrl.create)

/**
 * @swagger
 * /api/masss/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [MASSS - Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Task found with populated module and exam
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/:id', ctrl.getOne)

/**
 * @swagger
 * /api/masss/tasks/{id}:
 *   patch:
 *     summary: Partially update a task
 *     description: >
 *       Only updates the fields you send. All fields are optional.
 *       Use this to change status, priority, difficulty, deadline, etc.
 *     tags: [MASSS - Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "64abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               difficulty:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               estimated_pomodoros:
 *                 type: integer
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               is_fixed:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, archived]
 *               exam_id:
 *                 type: string
 *                 nullable: true
 *           example:
 *             priority: medium
 *             status: completed
 *             estimated_pomodoros: 4
 *     responses:
 *       200:
 *         description: Task updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.patch('/:id', ctrl.update)

/**
 * @swagger
 * /api/masss/tasks/{id}:
 *   delete:
 *     summary: Archive a task (soft delete)
 *     description: Sets task status to archived. Does not permanently delete.
 *     tags: [MASSS - Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Task archived
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task archived successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.delete('/:id', ctrl.archive)

module.exports = router