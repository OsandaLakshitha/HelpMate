// backend/routes/calendar.js
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Note = require('../models/Note');
const mongoose = require('mongoose');

// OAuth2 client setup
function getOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

// Helper function to get user's calendar data using native MongoDB
async function getUserCalendarData(userId) {
    try {
        const db = mongoose.connection.db;
        const userDoc = await db.collection('users').findOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { projection: { googleCalendar: 1, upcomingExams: 1 } }
        );
        return userDoc;
    } catch (error) {
        console.error('Error fetching user calendar data:', error);
        return null;
    }
}

// ============== CONFIG CHECK ==============
router.get('/config-check', (req, res) => {
    res.json({
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
});

// ============== GET CALENDAR STATUS ==============
router.get('/status', protect, async (req, res) => {
    try {
        const userData = await getUserCalendarData(req.user._id);
        const calendarData = userData?.googleCalendar;
        
        res.json({
            connected: calendarData?.connected || false,
            syncEnabled: calendarData?.syncEnabled || false,
            hasAccessToken: !!calendarData?.accessToken,
            hasRefreshToken: !!calendarData?.refreshToken,
            lastSync: calendarData?.lastSync || null,
            examsCount: userData?.upcomingExams?.length || 0
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.json({ connected: false, syncEnabled: false });
    }
});

// ============== GET AUTH URL ==============
router.get('/auth-url', protect, async (req, res) => {
    try {
        const oauth2Client = getOAuth2Client();
        const state = req.user._id.toString();
        
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: ['https://www.googleapis.com/auth/calendar.readonly'],
            state: state
        });
        
        res.json({ authUrl, state });
    } catch (error) {
        console.error('Auth URL error:', error);
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

// ============== OAUTH CALLBACK ==============
router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (!code || !state) {
        return res.redirect(`${frontendUrl}/user/dashboard?calendar=error&reason=missing_params`);
    }
    
    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('✅ Tokens received from Google');
        
        // Save tokens using native MongoDB to bypass any Mongoose issues
        const db = mongoose.connection.db;
        const result = await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(state) },
            {
                $set: {
                    'googleCalendar.connected': true,
                    'googleCalendar.accessToken': tokens.access_token,
                    'googleCalendar.refreshToken': tokens.refresh_token,
                    'googleCalendar.tokenExpiry': new Date(tokens.expiry_date),
                    'googleCalendar.syncEnabled': true,
                    'googleCalendar.calendarId': 'primary',
                    'googleCalendar.lastSync': new Date()
                }
            }
        );
        
        console.log('✅ Tokens saved to database:', result.modifiedCount > 0);
        
        res.redirect(`${frontendUrl}/user/dashboard?calendar=connected`);
    } catch (error) {
        console.error('❌ OAuth callback error:', error);
        res.redirect(`${frontendUrl}/user/dashboard?calendar=error&reason=token_exchange_failed`);
    }
});

// ============== SYNC CALENDAR ==============
router.post('/sync', protect, async (req, res) => {
    console.log('\n🔄 ========== SYNC REQUEST ==========');
    
    try {
        const userId = req.user._id.toString();
        console.log('User ID:', userId);
        
        // Get calendar data using native MongoDB
        const userData = await getUserCalendarData(userId);
        const calendarData = userData?.googleCalendar;
        
        console.log('📊 Calendar data check:');
        console.log('   Data exists:', !!calendarData);
        console.log('   Connected:', calendarData?.connected);
        console.log('   Has access token:', !!calendarData?.accessToken);
        console.log('   Has refresh token:', !!calendarData?.refreshToken);
        
        if (!calendarData?.connected || !calendarData?.accessToken) {
            console.log('❌ Not connected or no token');
            return res.status(400).json({ 
                error: 'Google Calendar not connected',
                needsReconnect: true
            });
        }
        
        // Setup OAuth client with tokens
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({
            access_token: calendarData.accessToken,
            refresh_token: calendarData.refreshToken
        });
        
        // Fetch calendar events
        console.log('📅 Fetching calendar events...');
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const now = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: threeMonthsLater.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100
        });
        
        const events = response.data.items || [];
        console.log(`📅 Found ${events.length} calendar events`);
        
        // Filter for exam-related events
        const examKeywords = ['exam', 'test', 'quiz', 'midterm', 'final', 'assessment', 'evaluation'];
        const modulePattern = /\b([A-Z]{2,4}\s?\d{3,4})\b/i;
        
        const examEvents = events.filter(event => {
            const title = (event.summary || '').toLowerCase();
            const description = (event.description || '').toLowerCase();
            const combined = title + ' ' + description;
            
            return examKeywords.some(keyword => combined.includes(keyword)) ||
                   modulePattern.test(event.summary || '');
        });
        
        console.log(`📝 Found ${examEvents.length} exam-related events`);
        
        // Get existing manual exams (keep them)
        const existingManualExams = (userData.upcomingExams || []).filter(e => e.isManual);
        console.log(`✏️ Keeping ${existingManualExams.length} manual exams`);
        
        // Process exam events
        const newExams = examEvents.map(event => {
            const title = event.summary || 'Untitled Exam';
            const moduleMatch = title.match(modulePattern);
            const moduleCode = moduleMatch ? moduleMatch[1].toUpperCase().replace(/\s/g, '') : '';
            
            return {
                title: title,
                date: new Date(event.start.dateTime || event.start.date),
                moduleCode: moduleCode,
                description: event.description || '',
                calendarEventId: event.id,
                isManual: false,
                dismissed: false,
                prepStarted: false,
                createdAt: new Date()
            };
        });
        
        // Combine manual exams with synced exams (avoid duplicates)
        const allExams = [...existingManualExams];
        
        for (const newExam of newExams) {
            const isDuplicate = allExams.some(e => 
                e.calendarEventId === newExam.calendarEventId ||
                (e.title === newExam.title && e.date.getTime() === newExam.date.getTime())
            );
            if (!isDuplicate) {
                allExams.push(newExam);
            }
        }
        
        // Sort by date
        allExams.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Save to database using native MongoDB
        const db = mongoose.connection.db;
        await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            {
                $set: {
                    'upcomingExams': allExams,
                    'googleCalendar.lastSync': new Date()
                }
            }
        );
        
        console.log(`✅ Sync complete. ${allExams.length} total exams saved`);
        console.log('🔄 ========== SYNC COMPLETE ==========\n');
        
        res.json({
            success: true,
            message: `Found ${examEvents.length} exams from calendar`,
            totalExams: allExams.length,
            syncedExams: newExams.length,
            manualExams: existingManualExams.length,
            exams: allExams
        });
        
    } catch (error) {
        console.error('❌ Sync error:', error);
        
        if (error.code === 401 || error.message?.includes('invalid_grant')) {
            // Token expired or revoked
            const db = mongoose.connection.db;
            await db.collection('users').updateOne(
                { _id: new mongoose.Types.ObjectId(req.user._id) },
                { $set: { 'googleCalendar.connected': false } }
            );
            
            return res.status(401).json({ 
                error: 'Calendar access expired. Please reconnect.',
                needsReconnect: true
            });
        }
        
        res.status(500).json({ error: 'Failed to sync calendar: ' + error.message });
    }
});

// ============== GET EXAMS (Saved in database) ==============
router.get('/exams', protect, async (req, res) => {
    try {
        const userData = await getUserCalendarData(req.user._id);
        const exams = userData?.upcomingExams || [];
        
        // Filter out past and dismissed exams
        const now = new Date();
        const activeExams = exams.filter(exam => {
            const examDate = new Date(exam.date);
            return examDate >= now && !exam.dismissed;
        });
        
        // Get related notes count for each exam
        const examsWithNotes = await Promise.all(activeExams.map(async (exam) => {
            let relatedNotesCount = 0;
            
            if (exam.moduleCode) {
                relatedNotesCount = await Note.countDocuments({
                    userId: req.user._id,
                    moduleCode: new RegExp(exam.moduleCode, 'i')
                });
            }
            
            if (relatedNotesCount === 0 && exam.title) {
                // Try keyword matching
                const keywords = exam.title.split(/\s+/).filter(w => w.length > 3);
                if (keywords.length > 0) {
                    relatedNotesCount = await Note.countDocuments({
                        userId: req.user._id,
                        $or: keywords.slice(0, 3).map(k => ({
                            $or: [
                                { fileName: new RegExp(k, 'i') },
                                { moduleName: new RegExp(k, 'i') }
                            ]
                        }))
                    });
                }
            }
            
            return {
                ...exam,
                relatedNotes: relatedNotesCount,
                daysUntil: Math.ceil((new Date(exam.date) - now) / (1000 * 60 * 60 * 24))
            };
        }));
        
        res.json({
            success: true,
            exams: examsWithNotes,
            total: examsWithNotes.length
        });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ error: 'Failed to get exams' });
    }
});

// ============== ADD MANUAL EXAM ==============
router.post('/exams/manual', protect, async (req, res) => {
    try {
        const { title, date, moduleCode, description } = req.body;
        
        if (!title || !date) {
            return res.status(400).json({ error: 'Title and date are required' });
        }
        
        const newExam = {
            title,
            date: new Date(date),
            moduleCode: moduleCode?.toUpperCase() || '',
            description: description || '',
            isManual: true,
            dismissed: false,
            prepStarted: false,
            createdAt: new Date()
        };
        
        // Get related notes count
        let relatedNotesCount = 0;
        if (newExam.moduleCode) {
            relatedNotesCount = await Note.countDocuments({
                userId: req.user._id,
                moduleCode: new RegExp(newExam.moduleCode, 'i')
            });
        }
        
        // Add to user's exams using native MongoDB
        const db = mongoose.connection.db;
        await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(req.user._id) },
            { $push: { upcomingExams: newExam } }
        );
        
        console.log('✅ Manual exam added:', title);
        
        res.json({
            success: true,
            exam: {
                ...newExam,
                relatedNotes: relatedNotesCount,
                daysUntil: Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
            }
        });
    } catch (error) {
        console.error('Add manual exam error:', error);
        res.status(500).json({ error: 'Failed to add exam' });
    }
});

// ============== DISMISS EXAM ==============
router.patch('/exams/:examIndex/dismiss', protect, async (req, res) => {
    try {
        const { examIndex } = req.params;
        const index = parseInt(examIndex);
        
        const userData = await getUserCalendarData(req.user._id);
        const exams = userData?.upcomingExams || [];
        
        if (index < 0 || index >= exams.length) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        // Update the exam's dismissed status
        const db = mongoose.connection.db;
        await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(req.user._id) },
            { $set: { [`upcomingExams.${index}.dismissed`]: true } }
        );
        
        res.json({ success: true, message: 'Exam dismissed' });
    } catch (error) {
        console.error('Dismiss exam error:', error);
        res.status(500).json({ error: 'Failed to dismiss exam' });
    }
});

// ============== DELETE EXAM ==============
router.delete('/exams/:examIndex', protect, async (req, res) => {
    try {
        const { examIndex } = req.params;
        const index = parseInt(examIndex);
        
        const userData = await getUserCalendarData(req.user._id);
        const exams = userData?.upcomingExams || [];
        
        if (index < 0 || index >= exams.length) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        // Remove the exam
        exams.splice(index, 1);
        
        const db = mongoose.connection.db;
        await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(req.user._id) },
            { $set: { upcomingExams: exams } }
        );
        
        res.json({ success: true, message: 'Exam deleted' });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ error: 'Failed to delete exam' });
    }
});

// ============== DISCONNECT CALENDAR ==============
router.post('/disconnect', protect, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(req.user._id) },
            {
                $set: {
                    'googleCalendar.connected': false,
                    'googleCalendar.accessToken': null,
                    'googleCalendar.refreshToken': null,
                    'googleCalendar.tokenExpiry': null,
                    'googleCalendar.syncEnabled': false
                }
            }
        );
        
        res.json({ success: true, message: 'Calendar disconnected' });
    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({ error: 'Failed to disconnect calendar' });
    }
});

// ============== DEBUG ENDPOINT ==============
router.get('/debug/:userId', async (req, res) => {
    try {
        const userData = await getUserCalendarData(req.params.userId);
        
        res.json({
            userId: req.params.userId,
            googleCalendar: {
                connected: userData?.googleCalendar?.connected,
                hasAccessToken: !!userData?.googleCalendar?.accessToken,
                hasRefreshToken: !!userData?.googleCalendar?.refreshToken,
                tokenExpiry: userData?.googleCalendar?.tokenExpiry,
                lastSync: userData?.googleCalendar?.lastSync
            },
            upcomingExams: userData?.upcomingExams?.length || 0,
            exams: userData?.upcomingExams?.map(e => ({
                title: e.title,
                date: e.date,
                moduleCode: e.moduleCode,
                isManual: e.isManual
            })) || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
