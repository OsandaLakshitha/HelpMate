import express from 'express';
import { getUserInsights } from '../../controllers/Bcontrollers/insightController.js';

const router = express.Router();

// GET /api/insights/:userId
router.get('/:userId', getUserInsights);

export default router;
