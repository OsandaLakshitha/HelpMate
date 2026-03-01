import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  getMyPrediction,
  getAllPredictions,
  recalcPrediction,
} from '../../controllers/Bcontrollers/Predictioncontroller.js';

const router = Router();

router.get('/:projectId',          protect, getMyPrediction);   // my prediction for project
router.get('/:projectId/all',      protect, getAllPredictions);  // all members' statuses
router.post('/:projectId/recalc',  protect, recalcPrediction);  // manual recalculate

export default router;