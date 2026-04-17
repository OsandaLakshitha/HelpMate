const express = require('express');
const router = express.Router();
const {
    addRoutineEvent,
    setSlotPreference
} = require('../../controllers/masss/profileController');
const {
    completeOnboarding
} = require('../../controllers/masss/onboardingController');
const { protect } = require('../../middleware/auth');

router.use(protect);

// Routine Management
router.post('/routine', addRoutineEvent); 

// Preference Management
router.post('/preferences', setSlotPreference);

// Onboarding
router.post('/onboarding/complete', completeOnboarding);

module.exports = router;