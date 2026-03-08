// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Note = require('../models/Note');
const User = require('../models/User');
const ExamPrep = require('../models/ExamPrep');

// ============== GET DASHBOARD STATS ==============
router.get('/stats', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get all user notes
        const notes = await Note.find({ userId }).lean();
        
        // Calculate stats
        const totalNotes = notes.length;
        const totalMcqs = notes.reduce((sum, n) => sum + (n.mcqs?.length || 0), 0);
        const totalFlashcards = notes.reduce((sum, n) => sum + (n.flashCards?.length || 0), 0);
        const totalShortNotePoints = notes.reduce((sum, n) => sum + (n.shortNotes?.totalPoints || 0), 0);
        
        // Quiz stats
        let totalQuizAttempts = 0;
        let totalScore = 0;
        let bestScore = 0;
        
        notes.forEach(note => {
            if (note.quizAttempts && note.quizAttempts.length > 0) {
                totalQuizAttempts += note.quizAttempts.length;
                note.quizAttempts.forEach(attempt => {
                    totalScore += attempt.percentage || 0;
                    if (attempt.percentage > bestScore) {
                        bestScore = attempt.percentage;
                    }
                });
            }
        });
        
        const averageScore = totalQuizAttempts > 0 
            ? Math.round(totalScore / totalQuizAttempts) 
            : 0;
        
        // Get module breakdown
        const moduleBreakdown = {};
        notes.forEach(note => {
            const code = note.moduleCode || 'Uncategorized';
            if (!moduleBreakdown[code]) {
                moduleBreakdown[code] = {
                    moduleCode: code,
                    moduleName: note.moduleName || '',
                    noteCount: 0,
                    mcqCount: 0,
                    flashcardCount: 0,
                    quizAttempts: 0,
                    averageScore: 0,
                    totalScore: 0
                };
            }
            moduleBreakdown[code].noteCount += 1;
            moduleBreakdown[code].mcqCount += note.mcqs?.length || 0;
            moduleBreakdown[code].flashcardCount += note.flashCards?.length || 0;
            
            if (note.quizAttempts) {
                moduleBreakdown[code].quizAttempts += note.quizAttempts.length;
                note.quizAttempts.forEach(a => {
                    moduleBreakdown[code].totalScore += a.percentage || 0;
                });
            }
        });
        
        // Calculate average scores per module
        Object.values(moduleBreakdown).forEach(module => {
            if (module.quizAttempts > 0) {
                module.averageScore = Math.round(module.totalScore / module.quizAttempts);
            }
            delete module.totalScore;
        });
        
        // Get recent activity
        const recentNotes = await Note.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('fileName moduleCode updatedAt quizAttempts stats')
            .lean();
        
        const recentActivity = [];
        
        recentNotes.forEach(note => {
            // Note upload
            recentActivity.push({
                type: 'upload',
                title: `Uploaded ${note.fileName.replace('.pdf', '')}`,
                subtitle: note.moduleCode || 'Note',
                timestamp: note.updatedAt,
                icon: '📄'
            });
            
            // Recent quiz attempts
            if (note.quizAttempts && note.quizAttempts.length > 0) {
                const latestAttempt = note.quizAttempts[note.quizAttempts.length - 1];
                recentActivity.push({
                    type: 'quiz',
                    title: `Quiz: ${latestAttempt.percentage}% on ${note.fileName.replace('.pdf', '')}`,
                    subtitle: `${latestAttempt.score}/${latestAttempt.totalQuestions} correct`,
                    timestamp: latestAttempt.attemptedAt,
                    icon: '📝'
                });
            }
        });
        
        // Sort by timestamp and limit
        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Get user study stats
        const user = await User.findById(userId).select('studyStats achievements googleCalendar detectedExams').lean();
        
        // Get upcoming exams
        const upcomingExams = (user?.detectedExams || [])
            .filter(exam => new Date(exam.examDate) > new Date())
            .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
            .slice(0, 5);
        
        // For each exam, count related notes
        for (let exam of upcomingExams) {
            if (exam.moduleCode) {
                const relatedNotes = notes.filter(n => 
                    n.moduleCode?.toLowerCase() === exam.moduleCode.toLowerCase()
                );
                exam.relatedNotesCount = relatedNotes.length;
                exam.totalMcqs = relatedNotes.reduce((sum, n) => sum + (n.mcqs?.length || 0), 0);
                exam.totalFlashcards = relatedNotes.reduce((sum, n) => sum + (n.flashCards?.length || 0), 0);
            }
        }
        
        res.json({
            success: true,
            stats: {
                totalNotes,
                totalMcqs,
                totalFlashcards,
                totalShortNotePoints,
                totalQuizAttempts,
                averageScore,
                bestScore,
                studyStreak: user?.studyStats?.currentStreak || 0,
                longestStreak: user?.studyStats?.longestStreak || 0,
                totalStudyTime: user?.studyStats?.totalStudyTime || 0
            },
            moduleBreakdown: Object.values(moduleBreakdown),
            recentActivity: recentActivity.slice(0, 10),
            upcomingExams,
            calendarConnected: user?.googleCalendar?.connected || false,
            achievements: user?.achievements || []
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

// ============== GET WEEKLY ACTIVITY ==============
router.get('/weekly-activity', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            days.push({
                date: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                notesUploaded: 0,
                quizzesTaken: 0,
                mcqsAnswered: 0,
                flashcardsReviewed: 0
            });
        }
        
        // Get notes from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const notes = await Note.find({
            userId,
            createdAt: { $gte: weekAgo }
        }).select('createdAt quizAttempts').lean();
        
        notes.forEach(note => {
            const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
            const dayIndex = days.findIndex(d => d.date === noteDate);
            if (dayIndex !== -1) {
                days[dayIndex].notesUploaded += 1;
            }
            
            // Count quiz attempts per day
            if (note.quizAttempts) {
                note.quizAttempts.forEach(attempt => {
                    const attemptDate = new Date(attempt.attemptedAt).toISOString().split('T')[0];
                    const idx = days.findIndex(d => d.date === attemptDate);
                    if (idx !== -1) {
                        days[idx].quizzesTaken += 1;
                        days[idx].mcqsAnswered += attempt.totalQuestions || 0;
                    }
                });
            }
        });
        
        res.json({
            success: true,
            weeklyActivity: days
        });
    } catch (err) {
        console.error('Weekly activity error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch weekly activity' });
    }
});

// ============== GET MODULE DETAILS ==============
router.get('/module/:moduleCode', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { moduleCode } = req.params;
        
        const notes = await Note.find({ 
            userId, 
            moduleCode: new RegExp(`^${moduleCode}$`, 'i') 
        }).lean();
        
        if (notes.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'No notes found for this module' 
            });
        }
        
        // Combine all MCQs
        const allMcqs = notes.flatMap(n => n.mcqs || []);
        
        // Combine all flashcards
        const allFlashcards = notes.flatMap(n => n.flashCards || []);
        
        // Combine all short notes
        const allShortNotes = {
            summary: notes.map(n => n.shortNotes?.summary || '').filter(Boolean).join(' '),
            sections: notes.flatMap(n => n.shortNotes?.sections || []),
            totalPoints: notes.reduce((sum, n) => sum + (n.shortNotes?.totalPoints || 0), 0)
        };
        
        // Quiz history
        const quizHistory = [];
        notes.forEach(note => {
            if (note.quizAttempts) {
                note.quizAttempts.forEach(attempt => {
                    quizHistory.push({
                        noteId: note._id,
                        noteName: note.fileName,
                        ...attempt
                    });
                });
            }
        });
        
        quizHistory.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
        
        res.json({
            success: true,
            moduleCode,
            moduleName: notes[0].moduleName || '',
            totalNotes: notes.length,
            notes: notes.map(n => ({
                id: n._id,
                fileName: n.fileName,
                uploadedAt: n.createdAt,
                stats: n.stats
            })),
            mcqs: allMcqs,
            flashcards: allFlashcards,
            shortNotes: allShortNotes,
            quizHistory: quizHistory.slice(0, 20),
            stats: {
                totalMcqs: allMcqs.length,
                totalFlashcards: allFlashcards.length,
                totalQuizAttempts: quizHistory.length,
                averageScore: quizHistory.length > 0 
                    ? Math.round(quizHistory.reduce((sum, q) => sum + q.percentage, 0) / quizHistory.length)
                    : 0
            }
        });
    } catch (err) {
        console.error('Module details error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch module details' });
    }
});

// ============== UPDATE STUDY SESSION ==============
router.post('/study-session', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { duration, noteId, mcqsAttempted, mcqsCorrect, flashcardsReviewed } = req.body;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        // Add study session
        user.studySessions.push({
            date: new Date(),
            duration: duration || 0,
            notesStudied: noteId ? [noteId] : [],
            mcqsAttempted: mcqsAttempted || 0,
            mcqsCorrect: mcqsCorrect || 0,
            flashcardsReviewed: flashcardsReviewed || 0
        });
        
        // Keep only last 100 sessions
        if (user.studySessions.length > 100) {
            user.studySessions = user.studySessions.slice(-100);
        }
        
        // Update stats
        user.studyStats.totalStudyTime += duration || 0;
        user.studyStats.totalMcqsAttempted += mcqsAttempted || 0;
        user.studyStats.totalMcqsCorrect += mcqsCorrect || 0;
        user.studyStats.totalFlashcardsReviewed += flashcardsReviewed || 0;
        
        // Update streak
        user.updateStreak();
        
        // Check achievements
        const newAchievements = user.checkAchievements();
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Study session recorded',
            currentStreak: user.studyStats.currentStreak,
            newAchievements
        });
    } catch (err) {
        console.error('Study session error:', err);
        res.status(500).json({ success: false, error: 'Failed to record study session' });
    }
});

// ============== GET STUDY ANALYTICS ==============
router.get('/analytics', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = '30' } = req.query; // days
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));
        
        const user = await User.findById(userId)
            .select('studySessions studyStats achievements')
            .lean();
        
        const notes = await Note.find({
            userId,
            createdAt: { $gte: daysAgo }
        }).select('createdAt quizAttempts moduleCode').lean();
        
        // Daily breakdown
        const dailyData = {};
        for (let i = 0; i < parseInt(period); i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyData[dateStr] = {
                date: dateStr,
                studyTime: 0,
                mcqsAttempted: 0,
                mcqsCorrect: 0,
                flashcardsReviewed: 0,
                quizzesTaken: 0
            };
        }
        
        // Fill in from study sessions
        (user?.studySessions || []).forEach(session => {
            const dateStr = new Date(session.date).toISOString().split('T')[0];
            if (dailyData[dateStr]) {
                dailyData[dateStr].studyTime += session.duration || 0;
                dailyData[dateStr].mcqsAttempted += session.mcqsAttempted || 0;
                dailyData[dateStr].mcqsCorrect += session.mcqsCorrect || 0;
                dailyData[dateStr].flashcardsReviewed += session.flashcardsReviewed || 0;
            }
        });
        
        // Fill in quiz attempts from notes
        notes.forEach(note => {
            (note.quizAttempts || []).forEach(attempt => {
                const dateStr = new Date(attempt.attemptedAt).toISOString().split('T')[0];
                if (dailyData[dateStr]) {
                    dailyData[dateStr].quizzesTaken += 1;
                }
            });
        });
        
        // Calculate trends
        const totalDays = Object.keys(dailyData).length;
        const halfPoint = Math.floor(totalDays / 2);
        const allDates = Object.keys(dailyData).sort();
        
        const firstHalf = allDates.slice(0, halfPoint);
        const secondHalf = allDates.slice(halfPoint);
        
        const firstHalfAvg = firstHalf.reduce((sum, d) => sum + dailyData[d].mcqsAttempted, 0) / (firstHalf.length || 1);
        const secondHalfAvg = secondHalf.reduce((sum, d) => sum + dailyData[d].mcqsAttempted, 0) / (secondHalf.length || 1);
        
        const trend = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
        
        res.json({
            success: true,
            dailyData: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
            summary: {
                totalStudyTime: Object.values(dailyData).reduce((sum, d) => sum + d.studyTime, 0),
                totalMcqsAttempted: Object.values(dailyData).reduce((sum, d) => sum + d.mcqsAttempted, 0),
                totalFlashcardsReviewed: Object.values(dailyData).reduce((sum, d) => sum + d.flashcardsReviewed, 0),
                totalQuizzesTaken: Object.values(dailyData).reduce((sum, d) => sum + d.quizzesTaken, 0),
                averageDailyStudyTime: Math.round(
                    Object.values(dailyData).reduce((sum, d) => sum + d.studyTime, 0) / totalDays
                )
            },
            trend,
            studyStats: user?.studyStats || {},
            achievements: user?.achievements || []
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

// ============== GET LEADERBOARD ==============
router.get('/leaderboard', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get top users by various metrics
        const users = await User.find({ isActive: true })
            .select('firstName lastName studyStats avatar')
            .sort({ 'studyStats.totalMcqsAttempted': -1 })
            .limit(10)
            .lean();
        
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            name: `${user.firstName} ${user.lastName?.[0] || ''}.`,
            avatar: user.avatar,
            mcqsAttempted: user.studyStats?.totalMcqsAttempted || 0,
            quizzesTaken: user.studyStats?.totalQuizzesTaken || 0,
            averageScore: user.studyStats?.averageQuizScore || 0,
            streak: user.studyStats?.currentStreak || 0,
            isCurrentUser: user._id.toString() === userId.toString()
        }));
        
        // Find current user's rank if not in top 10
        const currentUserInTop = leaderboard.find(u => u.isCurrentUser);
        
        if (!currentUserInTop) {
            const currentUser = await User.findById(userId)
                .select('firstName lastName studyStats avatar')
                .lean();
            
            const rank = await User.countDocuments({
                'studyStats.totalMcqsAttempted': { $gt: currentUser?.studyStats?.totalMcqsAttempted || 0 }
            }) + 1;
            
            leaderboard.push({
                rank,
                name: `${currentUser?.firstName} ${currentUser?.lastName?.[0] || ''}.`,
                avatar: currentUser?.avatar,
                mcqsAttempted: currentUser?.studyStats?.totalMcqsAttempted || 0,
                quizzesTaken: currentUser?.studyStats?.totalQuizzesTaken || 0,
                averageScore: currentUser?.studyStats?.averageQuizScore || 0,
                streak: currentUser?.studyStats?.currentStreak || 0,
                isCurrentUser: true
            });
        }
        
        res.json({
            success: true,
            leaderboard
        });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
});

// ============== GET STUDY RECOMMENDATIONS ==============
router.get('/recommendations', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        const notes = await Note.find({ userId })
            .select('moduleCode moduleName fileName quizAttempts stats createdAt')
            .lean();
        
        const recommendations = [];
        
        // Find notes with low quiz scores
        notes.forEach(note => {
            if (note.quizAttempts && note.quizAttempts.length > 0) {
                const latestAttempt = note.quizAttempts[note.quizAttempts.length - 1];
                if (latestAttempt.percentage < 70) {
                    recommendations.push({
                        type: 'review',
                        priority: 'high',
                        title: `Review ${note.fileName.replace('.pdf', '')}`,
                        description: `Your last score was ${latestAttempt.percentage}%. Consider reviewing this material.`,
                        noteId: note._id,
                        moduleCode: note.moduleCode,
                        icon: '📚'
                    });
                }
            }
        });
        
        // Find notes never quizzed
        notes.forEach(note => {
            if (!note.quizAttempts || note.quizAttempts.length === 0) {
                recommendations.push({
                    type: 'practice',
                    priority: 'medium',
                    title: `Practice ${note.fileName.replace('.pdf', '')}`,
                    description: `You haven't taken a quiz on this note yet. Test your knowledge!`,
                    noteId: note._id,
                    moduleCode: note.moduleCode,
                    icon: '📝'
                });
            }
        });
        
        // Get user for exam recommendations
        const user = await User.findById(userId).select('detectedExams').lean();
        
        // Find upcoming exams without prep
        (user?.detectedExams || []).forEach(exam => {
            const daysUntil = Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntil > 0 && daysUntil <= 14 && !exam.prepGenerated) {
                recommendations.push({
                    type: 'exam',
                    priority: 'critical',
                    title: `Prepare for ${exam.title}`,
                    description: `Exam in ${daysUntil} days! Generate exam prep materials.`,
                    moduleCode: exam.moduleCode,
                    examDate: exam.examDate,
                    icon: '🎯'
                });
            }
        });
        
        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        res.json({
            success: true,
            recommendations: recommendations.slice(0, 10)
        });
    } catch (err) {
        console.error('Recommendations error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
    }
});

module.exports = router;
