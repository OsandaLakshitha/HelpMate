const express = require('express');
const router = express.Router();
const {
    addExam,
    getExamsByModule,
    updateExam
} = require('../../controllers/masss/examController');
const { protect } = require('../../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/masss/exams/module/{module_id}:
 *   post:
 *     summary: Add an exam to a module
 *     tags: [MASSS Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, due_date]
 *             properties:
 *               name:
 *                 type: string
 *               exam_type:
 *                 type: string
 *                 enum: [final, midterm, quiz, assignment, presentation, other]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               weight:
 *                 type: number
 *               is_completed:
 *                 type: boolean
 *           example:
 *             name: Midterm 1
 *             exam_type: midterm
 *             due_date: "2026-05-10T00:00:00.000Z"
 *             weight: 20
 *     responses:
 *       201:
 *         description: Exam created
 *   get:
 *     summary: Get exams by module
 *     tags: [MASSS Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of exams
 */
router.post('/module/:module_id', addExam);
router.get('/module/:module_id', getExamsByModule);

/**
 * @swagger
 * /api/masss/exams/{id}:
 *   put:
 *     summary: Update an exam
 *     tags: [MASSS Exams]
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
 *               exam_type:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               weight:
 *                 type: number
 *               is_completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Exam updated
 */
router.put('/:id', updateExam);

module.exports = router;