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

/**
 * @swagger
 * /api/masss/profile/routine:
 *   post:
 *     summary: Add a weekly routine event
 *     tags: [MASSS Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, activity_type, days, start_time, end_time]
 *             properties:
 *               name:
 *                 type: string
 *               activity_type:
 *                 type: string
 *                 enum: [class, sleep, habit, work]
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               start_time:
 *                 type: string
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 example: "10:30"
 *           example:
 *             name: Lecture
 *             activity_type: class
 *             days: [monday, wednesday, friday]
 *             start_time: "09:00"
 *             end_time: "10:30"
 *     responses:
 *       201:
 *         description: Routine event created
 */
router.post('/routine', addRoutineEvent);

/**
 * @swagger
 * /api/masss/profile/preferences:
 *   post:
 *     summary: Set slot preference
 *     tags: [MASSS Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slot_name]
 *             properties:
 *               slot_name:
 *                 type: string
 *                 enum: [morning, afternoon, evening]
 *               max_pomodoros:
 *                 type: number
 *               is_preferred:
 *                 type: boolean
 *           example:
 *             slot_name: morning
 *             max_pomodoros: 4
 *             is_preferred: true
 *     responses:
 *       200:
 *         description: Slot preference saved
 */
router.post('/preferences', setSlotPreference);

/**
 * @swagger
 * /api/masss/profile/onboarding/complete:
 *   post:
 *     summary: Complete MASSS onboarding
 *     tags: [MASSS Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chronotype, routine_events, slots]
 *             properties:
 *               chronotype:
 *                 type: string
 *                 enum: [morning_bird, night_owl, balanced]
 *               routine_events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     activity_type:
 *                       type: string
 *                       enum: [class, sleep, habit, work]
 *                     days:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     slot_name:
 *                       type: string
 *                       enum: [morning, afternoon, evening]
 *                     slot_label:
 *                       type: string
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *                     max_pomodoros:
 *                       type: number
 *           example:
 *             chronotype: balanced
 *             routine_events:
 *               - name: Lecture
 *                 activity_type: class
 *                 days: [monday, wednesday]
 *                 start_time: "09:00"
 *                 end_time: "10:30"
 *             slots:
 *               - slot_name: morning
 *                 slot_label: Morning Focus
 *                 start_time: "08:00"
 *                 end_time: "12:00"
 *                 max_pomodoros: 4
 *     responses:
 *       200:
 *         description: Onboarding completed
 */
router.post('/onboarding/complete', completeOnboarding);

module.exports = router;