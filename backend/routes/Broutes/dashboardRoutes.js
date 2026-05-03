// dashboardRoutes.js
import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  getStudentDashboard,
} from '../../controllers/Bcontrollers/dashboardController.js';

const router = Router();

// Keep old route name for frontend compatibility
router.get('/dashboard-summary', protect, getStudentDashboard);

// Daily targets route
//router.get('/daily-targets', protect, getDailyTargets);

export default router;