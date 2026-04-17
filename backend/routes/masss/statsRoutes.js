const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../../controllers/masss/statsController');
const { protect } = require('../../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/masss/stats/dashboard-summary:
 *   get:
 *     summary: Get MASSS dashboard summary
 *     tags: [MASSS Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router.get('/dashboard-summary', getDashboardSummary);

module.exports = router;