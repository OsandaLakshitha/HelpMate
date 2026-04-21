const express     = require('express')
const router      = express.Router()
const { protect } = require('../../middleware/auth')
const ctrl        = require('../../controllers/masss/moduleController')

router.use(protect)

/**
 * @swagger
 * /api/masss/modules:
 *   get:
 *     summary: Get all modules for the current user
 *     description: Returns all modules with their linked tasks (non-archived) and exams populated.
 *     tags: [MASSS - Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of module objects
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
 *                         example: "64abc123def456"
 *                       name:
 *                         type: string
 *                         example: Advanced Mathematics
 *                       category:
 *                         type: string
 *                         enum: [coding, math_logic, language, creative_design, memorization, other]
 *                       color:
 *                         type: string
 *                         example: "#38BDF8"
 *                       energyTime:
 *                         type: string
 *                         enum: [morning, afternoon, evening]
 *                       tasks:
 *                         type: array
 *                       exams:
 *                         type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/', ctrl.getAll)

/**
 * @swagger
 * /api/masss/modules:
 *   post:
 *     summary: Create a new module with optional exams
 *     description: >
 *       Creates a module and optionally creates linked exam documents in the same request.
 *       Returns the populated module with tasks and exams arrays.
 *     tags: [MASSS - Modules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Advanced Mathematics
 *               category:
 *                 type: string
 *                 enum: [coding, math_logic, language, creative_design, memorization, other]
 *                 example: math_logic
 *               color:
 *                 type: string
 *                 description: Hex colour string
 *                 example: "#38BDF8"
 *               energy_time:
 *                 type: string
 *                 enum: [morning, afternoon, evening]
 *                 example: morning
 *               exams:
 *                 type: array
 *                 description: Optional list of exams to create with the module
 *                 items:
 *                   type: object
 *                   required: [name, exam_type, due_date]
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Final Exam
 *                     exam_type:
 *                       type: string
 *                       enum: [final, midterm, quiz, assignment, presentation, other]
 *                     due_date:
 *                       type: string
 *                       format: date
 *                       example: "2025-12-01"
 *                     weight:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                       example: 40
 *           example:
 *             name: Advanced Mathematics
 *             category: math_logic
 *             color: "#38BDF8"
 *             energy_time: morning
 *             exams:
 *               - name: Final Exam
 *                 exam_type: final
 *                 due_date: "2025-12-01"
 *                 weight: 40
 *               - name: Midterm
 *                 exam_type: midterm
 *                 due_date: "2025-10-15"
 *                 weight: 30
 *     responses:
 *       201:
 *         description: Module created successfully
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
 *         description: Module name is required
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
 *                   example: Module name is required
 *       401:
 *         description: Unauthorized
 */
router.post('/', ctrl.create)

/**
 * @swagger
 * /api/masss/modules/{id}:
 *   get:
 *     summary: Get a single module by ID
 *     tags: [MASSS - Modules]
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
 *         description: Module found
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Module not found
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
 *                   example: Module not found
 */
router.get('/:id', ctrl.getOne)

/**
 * @swagger
 * /api/masss/modules/{id}:
 *   put:
 *     summary: Update a module
 *     tags: [MASSS - Modules]
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
 *                 example: Advanced Maths II
 *               category:
 *                 type: string
 *                 enum: [coding, math_logic, language, creative_design, memorization, other]
 *               color:
 *                 type: string
 *                 example: "#818CF8"
 *               energy_time:
 *                 type: string
 *                 enum: [morning, afternoon, evening]
 *           example:
 *             name: Advanced Maths II
 *             color: "#818CF8"
 *             energy_time: afternoon
 *     responses:
 *       200:
 *         description: Module updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Module not found
 */
router.put('/:id', ctrl.update)

/**
 * @swagger
 * /api/masss/modules/{id}:
 *   delete:
 *     summary: Delete a module and all related tasks and exams
 *     description: >
 *       Permanently deletes the module along with all tasks and exams
 *       that belong to it. This action cannot be undone.
 *     tags: [MASSS - Modules]
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
 *         description: Module and all related data deleted
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
 *                   example: Module and all related data deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Module not found
 */
router.delete('/:id', ctrl.delete)

module.exports = router