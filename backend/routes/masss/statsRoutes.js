const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../../controllers/masss/statsController');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.get('/dashboard-summary', getDashboardSummary); // GET /stats/dashboard-summary

module.exports = router;