import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  
  getDashboardSummary   // ✅ make sure this is exported in your controller
} from '../../controllers/Bcontrollers/dashboardController.js';

const router = Router();

// Dashboard summary route
router.get('/dashboard-summary', protect, getDashboardSummary);

// Other dashboard routes
//router.get('/summary', protect, summary);
//router.get('/trend', protect, tasksTrend); // ?period=daily|weekly|monthly
//router.get('/ongoing', protect, ongoingTasks);

export default router;
