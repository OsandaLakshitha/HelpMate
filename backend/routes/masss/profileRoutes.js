const express     = require('express')
const router      = express.Router()
const { protect } = require('../../middleware/auth')
const onboarding  = require('../../controllers/masss/onboardingController')
const profile     = require('../../controllers/masss/profileController')

router.use(protect)

// ═══════════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/masss/onboarding/status:
 *   get:
 *     summary: Get MASSS onboarding status for the current user
 *     tags: [MASSS - Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 onboarding_completed:
 *                   type: boolean
 *                   example: false
 *                 user_id:
 *                   type: string
 *                   example: "64abc123def456"
 *                 username:
 *                   type: string
 *                   example: "John"
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not authorized to access this route"
 */
router.get('/onboarding/status', onboarding.getStatus)

/**
 * @swagger
 * /api/masss/onboarding/slot-defaults/{chronotype}:
 *   get:
 *     summary: Get default slot configuration for a chronotype
 *     description: >
 *       Returns pre-filled slot times based on the user's chronotype.
 *       Called in onboarding Step 1 when the user selects their chronotype
 *       to pre-populate the slot configurator in Step 3.
 *     tags: [MASSS - Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chronotype
 *         required: true
 *         schema:
 *           type: string
 *           enum: [morning_bird, night_owl, balanced]
 *         example: morning_bird
 *     responses:
 *       200:
 *         description: Slot defaults returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chronotype:
 *                   type: string
 *                   example: morning_bird
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slot_name:
 *                         type: string
 *                         example: morning
 *                       slot_label:
 *                         type: string
 *                         example: Morning Focus
 *                       start_time:
 *                         type: string
 *                         example: "07:00"
 *                       end_time:
 *                         type: string
 *                         example: "12:00"
 *                       max_pomodoros:
 *                         type: integer
 *                         example: 6
 *       400:
 *         description: Unknown chronotype value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unknown chronotype: invalid. Must be morning_bird, night_owl, or balanced."
 *       401:
 *         description: Unauthorized
 */
router.get('/onboarding/slot-defaults/:chronotype', onboarding.getSlotDefaults)

/**
 * @swagger
 * /api/masss/onboarding/complete:
 *   post:
 *     summary: Complete onboarding with chronotype, routine, and slot configuration
 *     description: >
 *       Saves the user's chronotype, weekly routine events, and 3 custom study slots.
 *       Marks onboarding as complete. Must provide exactly one slot for each of
 *       morning, afternoon, and evening.
 *     tags: [MASSS - Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chronotype, slots]
 *             properties:
 *               chronotype:
 *                 type: string
 *                 enum: [morning_bird, night_owl, balanced]
 *                 example: morning_bird
 *               slots:
 *                 type: array
 *                 minItems: 3
 *                 maxItems: 3
 *                 items:
 *                   type: object
 *                   required: [slot_name, slot_label, start_time, end_time, max_pomodoros]
 *                   properties:
 *                     slot_name:
 *                       type: string
 *                       enum: [morning, afternoon, evening]
 *                     slot_label:
 *                       type: string
 *                       example: Morning Focus
 *                     start_time:
 *                       type: string
 *                       example: "07:00"
 *                     end_time:
 *                       type: string
 *                       example: "12:00"
 *                     max_pomodoros:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 12
 *                       example: 6
 *               routine_events:
 *                 type: array
 *                 description: Optional list of weekly recurring events
 *                 items:
 *                   type: object
 *                   required: [name, activity_type, days, start_time, end_time]
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Physics Lecture
 *                     activity_type:
 *                       type: string
 *                       enum: [class, sleep, habit, work]
 *                     days:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                       example: [monday, wednesday]
 *                     start_time:
 *                       type: string
 *                       example: "09:00"
 *                     end_time:
 *                       type: string
 *                       example: "11:00"
 *           example:
 *             chronotype: morning_bird
 *             slots:
 *               - slot_name: morning
 *                 slot_label: Morning Focus
 *                 start_time: "07:00"
 *                 end_time: "12:00"
 *                 max_pomodoros: 6
 *               - slot_name: afternoon
 *                 slot_label: Afternoon
 *                 start_time: "13:00"
 *                 end_time: "17:00"
 *                 max_pomodoros: 3
 *               - slot_name: evening
 *                 slot_label: Wind Down
 *                 start_time: "18:00"
 *                 end_time: "21:00"
 *                 max_pomodoros: 1
 *             routine_events:
 *               - name: Physics Lecture
 *                 activity_type: class
 *                 days: [monday, wednesday]
 *                 start_time: "09:00"
 *                 end_time: "11:00"
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Onboarding completed successfully
 *                 onboarding_completed:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid chronotype or missing required fields
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error — missing slots or invalid slot names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Missing slots: evening"
 */
router.post('/onboarding/complete', onboarding.completeOnboarding)

/**
 * @swagger
 * /api/masss/onboarding/skip:
 *   post:
 *     summary: Skip onboarding and apply balanced defaults
 *     description: >
 *       Applies the balanced chronotype defaults and marks onboarding complete.
 *       Used when a user wants to skip setup and use sensible defaults.
 *     tags: [MASSS - Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding skipped, defaults applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Onboarding skipped
 *                 onboarding_completed:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 */
router.post('/onboarding/skip', onboarding.skipOnboarding)

// ═══════════════════════════════════════════════════════════════════
// PROFILE — PREFERENCES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/masss/profile/preferences:
 *   get:
 *     summary: Get all slot preferences for the current user
 *     tags: [MASSS - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of slot preference objects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64abc123def456"
 *                       slot_name:
 *                         type: string
 *                         enum: [morning, afternoon, evening]
 *                       slot_label:
 *                         type: string
 *                         example: Morning Focus
 *                       start_time:
 *                         type: string
 *                         example: "07:00"
 *                       end_time:
 *                         type: string
 *                         example: "12:00"
 *                       max_pomodoros:
 *                         type: integer
 *                         example: 6
 *                       inferred_energy_score:
 *                         type: number
 *                         format: float
 *                         example: 0.85
 *                       is_preferred:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized
 */
router.get('/profile/preferences', profile.getPreferences)

/**
 * @swagger
 * /api/masss/profile/preferences:
 *   post:
 *     summary: Create or update a single slot preference
 *     description: >
 *       Upserts a slot preference by slot_name. If a preference for that slot
 *       already exists it is updated. Otherwise a new one is created.
 *     tags: [MASSS - Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slot_name, max_pomodoros]
 *             properties:
 *               slot_name:
 *                 type: string
 *                 enum: [morning, afternoon, evening]
 *                 example: morning
 *               slot_label:
 *                 type: string
 *                 example: Deep Work
 *               start_time:
 *                 type: string
 *                 example: "07:00"
 *               end_time:
 *                 type: string
 *                 example: "12:00"
 *               max_pomodoros:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 6
 *               is_preferred:
 *                 type: boolean
 *                 example: true
 *           example:
 *             slot_name: morning
 *             slot_label: Deep Work
 *             start_time: "07:00"
 *             end_time: "12:00"
 *             max_pomodoros: 6
 *             is_preferred: true
 *     responses:
 *       200:
 *         description: Preference saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid slot_name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "slot_name must be morning, afternoon, or evening"
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/preferences', profile.setPreference)

// ═══════════════════════════════════════════════════════════════════
// PROFILE — ROUTINE
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/masss/profile/routine:
 *   get:
 *     summary: Get all weekly routine events for the current user
 *     tags: [MASSS - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of routine event objects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64abc123def456"
 *                       name:
 *                         type: string
 *                         example: Physics Lecture
 *                       activity_type:
 *                         type: string
 *                         enum: [class, sleep, habit, work]
 *                       day_of_week:
 *                         type: string
 *                         example: monday
 *                       start_time:
 *                         type: string
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         example: "11:00"
 *       401:
 *         description: Unauthorized
 */
router.get('/profile/routine', profile.getRoutine)

/**
 * @swagger
 * /api/masss/profile/routine:
 *   post:
 *     summary: Add a new recurring routine event
 *     description: >
 *       Creates one routine entry per day in the days array.
 *       Providing [monday, wednesday] creates 2 separate documents.
 *     tags: [MASSS - Profile]
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
 *                 example: Physics Lecture
 *               activity_type:
 *                 type: string
 *                 enum: [class, sleep, habit, work]
 *                 example: class
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 example: [monday, wednesday, friday]
 *               start_time:
 *                 type: string
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 example: "11:00"
 *           example:
 *             name: Physics Lecture
 *             activity_type: class
 *             days: [monday, wednesday, friday]
 *             start_time: "09:00"
 *             end_time: "11:00"
 *     responses:
 *       201:
 *         description: Routine events created (one per day)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: One entry per day provided
 *       400:
 *         description: Missing required fields or invalid day/activity_type values
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/routine', profile.addRoutineEvent)

/**
 * @swagger
 * /api/masss/profile/routine/{eventId}:
 *   delete:
 *     summary: Delete a weekly routine event by ID
 *     tags: [MASSS - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Event removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Event removed
 *       400:
 *         description: Invalid event ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.delete('/profile/routine/:eventId', profile.deleteRoutineEvent)

/**
 * @swagger
 * /api/masss/profile/routine/{eventId}:
 *   put:
 *     summary: Update a weekly routine event
 *     tags: [MASSS - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         example: "64abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Advanced Physics
 *               activity_type:
 *                 type: string
 *                 enum: [class, sleep, habit, work]
 *               start_time:
 *                 type: string
 *                 example: "10:00"
 *               end_time:
 *                 type: string
 *                 example: "12:00"
 *           example:
 *             name: Advanced Physics
 *             start_time: "10:00"
 *             end_time: "12:00"
 *     responses:
 *       200:
 *         description: Event updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.put('/profile/routine/:eventId', profile.updateRoutineEvent)

module.exports = router