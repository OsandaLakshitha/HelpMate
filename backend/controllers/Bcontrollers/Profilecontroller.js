import BStudentProfile from '../../models/Bmodels/BProfile.js';

// ── GET /api/profile/me ───────────────────────────────────────────────────────
// Called after every login.
// If no profile exists, creates one with onboardingCompleted = false.
// Frontend checks onboardingCompleted — redirects to onboarding page if false.
export async function getProfile(req, res) {
  try {
    const userId = req.user._id || req.user.id;

    let profile = await BStudentProfile.findOne({ userId });

    if (!profile) {
      profile = await BStudentProfile.create({ userId });
    }

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/profile/onboarding ─────────────────────────────────────────────
// Called once when student submits onboarding form.
// Saves weekday/weekend hours and marks onboardingCompleted = true.
export async function completeOnboarding(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { weekdays, weekends, courseCode, batchYear } = req.body;

    if (!weekdays || !weekends) {
      return res.status(400).json({ success: false, message: 'Weekday and weekend study hours are required' });
    }

    const profile = await BStudentProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          'availableTime.weekdays': Number(weekdays),
          'availableTime.weekends': Number(weekends),
          courseCode:              courseCode || null,
          batchYear:               batchYear  || null,
          onboardingCompleted:     true,
          onboardingCompletedAt:   new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('completeOnboarding error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── PUT /api/profile/time ─────────────────────────────────────────────────────
// Update global available time any time after onboarding
export async function updateAvailableTime(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { weekdays, weekends } = req.body;

    const profile = await BStudentProfile.findOneAndUpdate(
      { userId },
      { $set: { 'availableTime.weekdays': Number(weekdays), 'availableTime.weekends': Number(weekends) } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('updateAvailableTime error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}