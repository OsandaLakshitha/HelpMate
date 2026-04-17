const express = require('express');
const router = express.Router();
const {
    createModule,
    getModules,
    getModule,
    updateModule,
    deleteModule
} = require('../../controllers/masss/moduleController');
const { protect } = require('../../middleware/auth');

router.use(protect); // All module routes are private

/**
 * @swagger
 * /api/masss/modules:
 *   post:
 *     summary: Create a module
 *     tags: [MASSS Modules]
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
 *               category:
 *                 type: string
 *                 enum: [coding, math_logic, language, creative_design, memorization, other]
 *               color:
 *                 type: string
 *               energy_time:
 *                 type: string
 *                 enum: [morning, afternoon, evening]
 *               exams:
 *                 type: array
 *                 items:
 *                   type: object
 *           example:
 *             name: Software Engineering
 *             category: coding
 *             color: "#E89BAE"
 *             energy_time: afternoon
 *     responses:
 *       201:
 *         description: Module created
 *   get:
 *     summary: Get all modules
 *     tags: [MASSS Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of modules
 */
router.route('/')
    .post(createModule)
    .get(getModules);

/**
 * @swagger
 * /api/masss/modules/{id}:
 *   get:
 *     summary: Get a module by id
 *     tags: [MASSS Modules]
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
 *         description: Module found
 *   put:
 *     summary: Update a module
 *     tags: [MASSS Modules]
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
 *               category:
 *                 type: string
 *               color:
 *                 type: string
 *               energy_time:
 *                 type: string
 *     responses:
 *       200:
 *         description: Module updated
 *   delete:
 *     summary: Delete a module
 *     tags: [MASSS Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Module deleted
 */
router.route('/:id')
    .get(getModule)
    .put(updateModule)
    .delete(deleteModule);

module.exports = router;