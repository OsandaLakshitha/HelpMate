const express = require('express');
const router = express.Router();
const {
    createTask,
    readTasks,
    updateTask,
    archiveTask
} = require('../../controllers/masss/taskController');
const { protect } = require('../../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/masss/tasks:
 *   post:
 *     summary: Create a task
 *     tags: [MASSS Tasks]
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
 *               description:
 *                 type: string
 *               module_id:
 *                 type: string
 *               exam_id:
 *                 type: string
 *               estimated_pomodoros:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               difficulty:
 *                 type: number
 *               is_fixed:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, archived]
 *           example:
 *             name: Assignment 1
 *             description: Finish the coding part
 *             module_id: 65f000000000000000000001
 *             estimated_pomodoros: 3
 *             priority: medium
 *             difficulty: 4
 *     responses:
 *       201:
 *         description: Task created
 *   get:
 *     summary: Get tasks with optional filters
 *     tags: [MASSS Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: exam_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.route('/')
    .post(createTask)
    .get(readTasks);

/**
 * @swagger
 * /api/masss/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [MASSS Tasks]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               estimated_pomodoros:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *               difficulty:
 *                 type: number
 *               is_fixed:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *   delete:
 *     summary: Archive a task
 *     tags: [MASSS Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task archived
 */
router.route('/:id')
    .patch(updateTask)
    .delete(archiveTask);

module.exports = router;