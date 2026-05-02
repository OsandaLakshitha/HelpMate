import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  getProjectPrediction,
  getAllPredictions,
  refreshPrediction,
  getDailyLogs,
} from '../../controllers/Bcontrollers/Predictioncontroller.js';

const router = Router();

// GET  /api/predictions              — all predictions for current student
router.get('/',                   protect, getAllPredictions);

// GET  /api/predictions/:projectId   — prediction for one project
router.get('/:projectId',         protect, getProjectPrediction);

// POST /api/predictions/:projectId/refresh  — force recalculate
router.post('/:projectId/refresh', protect, refreshPrediction);

// GET  /api/predictions/:projectId/logs  — last 14 days of daily logs
router.get('/:projectId/logs',    protect, getDailyLogs);

export default router;