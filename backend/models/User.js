// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    // ============== EXISTING FIELDS ==============
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    university: {
      type: String,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
    },
    plan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise"],
      default: "Free",
    },
    avatar: {
      type: String,
      default: null,
    },

    // ============== PEER MATCHING FIELDS ==============
    interests: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    academicLevel: {
      type: String,
      enum: ["freshman", "sophomore", "junior", "senior", "graduate", "other"],
      default: "other",
    },
    goals: {
      type: [String],
      default: [],
    },

    // ============== ACCOUNT STATUS FIELDS ==============
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // ============== NEW: GOOGLE CALENDAR INTEGRATION ==============
    googleCalendar: {
      connected: {
        type: Boolean,
        default: false,
      },
      accessToken: {
        type: String,
        // IMPORTANT: Do NOT use select: false here - it breaks token retrieval
      },
      refreshToken: {
        type: String,
        // IMPORTANT: Do NOT use select: false here - it breaks token retrieval
      },
      tokenExpiry: {
        type: Date,
      },
      calendarId: {
        type: String,
        default: 'primary',
      },
      lastSynced: {
        type: Date,
      },
      syncEnabled: {
        type: Boolean,
        default: true,
      },
    },

    // ============== NEW: STUDY STATISTICS ==============
    studyStats: {
      totalStudyTime: {
        type: Number,
        default: 0, // in minutes
      },
      totalQuizzesTaken: {
        type: Number,
        default: 0,
      },
      totalCorrectAnswers: {
        type: Number,
        default: 0,
      },
      totalQuestionsAnswered: {
        type: Number,
        default: 0,
      },
      flashcardsReviewed: {
        type: Number,
        default: 0,
      },
      flashcardsKnown: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastStudyDate: {
        type: Date,
      },
      weeklyGoal: {
        type: Number,
        default: 5, // hours per week
      },
      weeklyProgress: {
        type: Number,
        default: 0, // hours completed this week
      },
    },

    // ============== NEW: STUDY PREFERENCES ==============
    studyPreferences: {
      dailyReminder: {
        type: Boolean,
        default: false,
      },
      reminderTime: {
        type: String,
        default: '09:00',
      },
      examAlertDays: {
        type: Number,
        default: 7, // Days before exam to start alerts
      },
      autoGenerateExamPrep: {
        type: Boolean,
        default: true, // Automatically generate exam prep when exam detected
      },
      preferredMcqCount: {
        type: Number,
        default: 20,
      },
      preferredFlashcardCount: {
        type: Number,
        default: 15,
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
    },

    // ============== NEW: ACHIEVEMENTS ==============
    achievements: [{
      type: {
        type: String,
        enum: [
          'first_upload',        // Uploaded first note
          'quiz_master',         // Scored 100% on a quiz
          'streak_7',            // 7 day streak
          'streak_30',           // 30 day streak
          'notes_10',            // Uploaded 10 notes
          'notes_50',            // Uploaded 50 notes
          'quizzes_10',          // Completed 10 quizzes
          'quizzes_50',          // Completed 50 quizzes
          'flashcard_master',    // Marked 100 flashcards as known
          'exam_ace',            // Scored 90%+ on exam prep
          'early_bird',          // Studied before 7am
          'night_owl',           // Studied after 11pm
          'module_master',       // Completed all materials for a module
          'consistent_learner',  // Studied every day for a week
        ],
      },
      earnedAt: {
        type: Date,
        default: Date.now,
      },
      metadata: {
        type: mongoose.Schema.Types.Mixed,
      },
    }],

    // ============== NEW: ACTIVITY LOG ==============
    recentActivity: [{
      action: {
        type: String,
        enum: [
          'note_uploaded',
          'quiz_completed',
          'flashcard_session',
          'exam_prep_started',
          'calendar_connected',
          'achievement_earned',
          'streak_updated',
        ],
      },
      details: {
        type: mongoose.Schema.Types.Mixed,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],

    // ============== NEW: DETECTED EXAMS FROM CALENDAR ==============
    upcomingExams: [{
      eventId: String,           // Google Calendar event ID
      title: String,             // Event title
      moduleCode: String,        // Extracted module code (e.g., IT3010)
      moduleName: String,        // Module name if found
      examDate: Date,            // Exam date
      examPrepId: {              // Link to generated ExamPrep
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamPrep',
      },
      prepGenerated: {
        type: Boolean,
        default: false,
      },
      notified: {
        type: Boolean,
        default: false,
      },
      dismissed: {
        type: Boolean,
        default: false,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// ============== INDEXES ==============
userSchema.index({ email: 1 });
userSchema.index({ 'upcomingExams.examDate': 1 });
userSchema.index({ 'studyStats.lastStudyDate': 1 });

// ============== MIDDLEWARE ==============

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============== INSTANCE METHODS ==============

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpire;
  // Also remove Google tokens from JSON output
  if (user.googleCalendar) {
    delete user.googleCalendar.accessToken;
    delete user.googleCalendar.refreshToken;
  }
  return user;
};

// Update study streak
userSchema.methods.updateStreak = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = this.studyStats.lastStudyDate;
  
  if (!lastStudy) {
    // First time studying
    this.studyStats.currentStreak = 1;
    this.studyStats.longestStreak = 1;
  } else {
    const lastStudyDate = new Date(lastStudy);
    lastStudyDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      // Consecutive day
      this.studyStats.currentStreak += 1;
      if (this.studyStats.currentStreak > this.studyStats.longestStreak) {
        this.studyStats.longestStreak = this.studyStats.currentStreak;
      }
    } else {
      // Streak broken
      this.studyStats.currentStreak = 1;
    }
  }
  
  this.studyStats.lastStudyDate = new Date();
  
  // Check for streak achievements
  if (this.studyStats.currentStreak === 7) {
    this.addAchievement('streak_7');
  }
  if (this.studyStats.currentStreak === 30) {
    this.addAchievement('streak_30');
  }
  
  await this.save();
};

// Add achievement
userSchema.methods.addAchievement = function (achievementType, metadata = {}) {
  // Check if already has this achievement
  const hasAchievement = this.achievements.some(a => a.type === achievementType);
  
  if (!hasAchievement) {
    this.achievements.push({
      type: achievementType,
      earnedAt: new Date(),
      metadata,
    });
    
    // Also add to activity log
    this.addActivity('achievement_earned', {
      achievement: achievementType,
      metadata,
    });
    
    return true;
  }
  return false;
};

// Add activity
userSchema.methods.addActivity = function (action, details = {}) {
  this.recentActivity.unshift({
    action,
    details,
    timestamp: new Date(),
  });
  
  // Keep only last 50 activities
  if (this.recentActivity.length > 50) {
    this.recentActivity = this.recentActivity.slice(0, 50);
  }
};

// Calculate average quiz score
userSchema.methods.getAverageScore = function () {
  if (this.studyStats.totalQuestionsAnswered === 0) return 0;
  return Math.round(
    (this.studyStats.totalCorrectAnswers / this.studyStats.totalQuestionsAnswered) * 100
  );
};

// Get active upcoming exams (not dismissed, in the future)
userSchema.methods.getActiveExams = function () {
  const now = new Date();
  return this.upcomingExams.filter(
    exam => !exam.dismissed && new Date(exam.examDate) > now
  ).sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
};

// ============== STATIC METHODS ==============

// Find users with upcoming exams in X days
userSchema.statics.findUsersWithUpcomingExams = function (daysAhead = 7) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  
  return this.find({
    'upcomingExams': {
      $elemMatch: {
        examDate: { $lte: targetDate, $gte: new Date() },
        dismissed: false,
        notified: false,
      },
    },
  });
};

// Get leaderboard
userSchema.statics.getLeaderboard = function (limit = 10) {
  return this.find({ isActive: true })
    .select('firstName lastName avatar studyStats.currentStreak studyStats.totalQuizzesTaken')
    .sort({ 'studyStats.currentStreak': -1, 'studyStats.totalQuizzesTaken': -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model("User", userSchema);
