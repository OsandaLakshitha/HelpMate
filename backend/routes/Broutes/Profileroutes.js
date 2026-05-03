import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  getProfile,
  completeOnboarding,
  updateAvailableTime,
} from '../../controllers/Bcontrollers/Profilecontroller.js';

const router = Router();

router.get('/me',          protect, getProfile);          // get profile + onboarding status
router.post('/onboarding', protect, completeOnboarding);  // submit onboarding form
router.put('/time',        protect, updateAvailableTime); // update time later

export default router;