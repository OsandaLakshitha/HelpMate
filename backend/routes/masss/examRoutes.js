const express     = require('express')
const router      = express.Router()
const { protect } = require('../../middleware/auth')
const ctrl        = require('../../controllers/masss/examController')

router.use(protect)

/**
 * @swagger
 * /api/masss/exams/module/{moduleId}:
 *   get:
 *     summary: Get all exams for a module
 *     tags: [MASSS - Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Array of exam objects for the module
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
 *                         example: Final Exam
 *                       examType:
 *                         type: string
 *                         enum: [final, midterm, quiz, assignment, presentation, other]
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       weight:
 *                         type: integer
 *                         example: 40
 *                       isCompleted:
 *                         type: boolean
 *                         example: false
 *       401:
 *         description: Unauthorized
 */
router.get('/module/:moduleId', ctrl.getByModule)

/**
 * @swagger
 * /api/masss/exams/module/{moduleId}:
 *   post:
 *     summary: Add an exam to a module
 *     description: Verifies module ownership before creating the exam.
 *     tags: [MASSS - Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
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
 *             required: [name, due_date]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Final Exam
 *               exam_type:
 *                 type: string
 *                 enum: [final, midterm, quiz, assignment, presentation, other]
 *                 example: final
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-01"
 *               weight:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 40
 *           example:
 *             name: Final Exam
 *             exam_type: final
 *             due_date: "2025-12-01"
 *             weight: 40
 *     responses:
 *       201:
 *         description: Exam created
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
 *         description: name and due_date are required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Module not found or does not belong to user
 */
router.post('/module/:moduleId', ctrl.create)

/**
 * @swagger
 * /api/masss/exams/{id}:
 *   get:
 *     summary: Get a single exam by ID
 *     tags: [MASSS - Exams]
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
 *         description: Exam found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam not found
 */
router.get('/:id', ctrl.getOne)

/**
 * @swagger
 * /api/masss/exams/{id}:
 *   put:
 *     summary: Update an exam
 *     description: Only sends the fields you want to update — all fields are optional.
 *     tags: [MASSS - Exams]
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
 *                 example: Updated Final Exam
 *               exam_type:
 *                 type: string
 *                 enum: [final, midterm, quiz, assignment, presentation, other]
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-15"
 *               weight:
 *                 type: integer
 *                 example: 50
 *               is_completed:
 *                 type: boolean
 *                 example: true
 *           example:
 *             name: Updated Final Exam
 *             due_date: "2025-12-15"
 *             weight: 50
 *             is_completed: false
 *     responses:
 *       200:
 *         description: Exam updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam not found
 */
router.put('/:id', ctrl.update)

/**
 * @swagger
 * /api/masss/exams/{id}:
 *   delete:
 *     summary: Delete an exam
 *     tags: [MASSS - Exams]
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
 *         description: Exam deleted
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
 *                   example: Exam deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam not found
 */
router.delete('/:id', ctrl.delete)

module.exports = router