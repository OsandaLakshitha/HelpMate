// src/pages/user/StudyDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

export default function StudyDashboard() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initRef = useRef(false);
    
    // Stats
    const [stats, setStats] = useState({
        totalNotes: 0,
        totalMCQs: 0,
        totalFlashCards: 0,
        totalQuizzesTaken: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyProgress: 0,
        weeklyGoal: 5,
        flashcardsReviewed: 0,
        flashcardsKnown: 0
    });
    
    // Calendar & Exams
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [connectingCalendar, setConnectingCalendar] = useState(false);
    
    // Recent notes
    const [recentNotes, setRecentNotes] = useState([]);
    
    // Achievements
    const [achievements, setAchievements] = useState([]);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [showManualExamModal, setShowManualExamModal] = useState(false);
    const [manualExam, setManualExam] = useState({ title: '', date: '', moduleCode: '', description: '' });
    const [toast, setToast] = useState(null);

    // All possible achievements
    const allAchievements = [
        { id: 'first_upload', icon: '📄', title: 'First Steps', description: 'Upload your first note' },
        { id: 'five_notes', icon: '📚', title: 'Note Collector', description: 'Upload 5 notes' },
        { id: 'ten_notes', icon: '🗂️', title: 'Study Hoarder', description: 'Upload 10 notes' },
        { id: 'first_quiz', icon: '✏️', title: 'Quiz Taker', description: 'Complete your first quiz' },
        { id: 'perfect_score', icon: '💯', title: 'Perfectionist', description: 'Get 100% on a quiz' },
        { id: 'quiz_master', icon: '🏆', title: 'Quiz Master', description: 'Complete 10 quizzes' },
        { id: 'streak_3', icon: '🔥', title: 'On Fire', description: '3 day study streak' },
        { id: 'streak_7', icon: '⚡', title: 'Unstoppable', description: '7 day study streak' },
        { id: 'streak_30', icon: '👑', title: 'Study Royalty', description: '30 day study streak' },
        { id: 'flashcard_100', icon: '🎴', title: 'Card Shark', description: 'Review 100 flashcards' },
        { id: 'early_bird', icon: '🌅', title: 'Early Bird', description: 'Study before 7 AM' },
        { id: 'night_owl', icon: '🦉', title: 'Night Owl', description: 'Study after 11 PM' },
    ];

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;
        
        // Check for OAuth callback
        const calendarParam = searchParams.get('calendar');
        if (calendarParam === 'connected') {
            showToast('Google Calendar connected successfully!', 'success');
            window.history.replaceState({}, '', '/user/dashboard');
        } else if (calendarParam === 'error') {
            showToast('Failed to connect Google Calendar', 'error');
            window.history.replaceState({}, '', '/user/dashboard');
        }
        
        loadDashboard();
    }, [searchParams]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStats(),
                fetchRecentNotes(),
                checkCalendarStatus(),
                fetchAchievements()
            ]);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await api.get('/api/notes/meta/stats');
            if (data.stats) {
                setStats(prev => ({ ...prev, ...data.stats }));
            }
        } catch (err) {
            console.error('Stats error:', err);
        }
    };

    const fetchRecentNotes = async () => {
        try {
            const data = await api.get('/api/notes/list');
            if (data.notes) {
                setRecentNotes(data.notes.slice(0, 5));
            }
        } catch (err) {
            console.error('Notes error:', err);
        }
    };

    const fetchAchievements = async () => {
        try {
            const data = await api.get('/api/dashboard/achievements');
            if (data.achievements) {
                setAchievements(data.achievements);
            }
        } catch (err) {
            // If endpoint doesn't exist yet, use mock data based on stats
            console.log('Achievements endpoint not found, using calculated achievements');
        }
    };

    const checkCalendarStatus = async () => {
        try {
            const data = await api.get('/api/calendar/status');
            console.log('Calendar status:', data);
            setCalendarConnected(data.connected || false);
            
            // ALWAYS fetch exams - they might have been saved from previous syncs or added manually
            await fetchUpcomingExams();
        } catch (err) {
            console.error('Calendar status error:', err);
            setCalendarConnected(false);
            // Still try to fetch exams even if calendar status fails
            await fetchUpcomingExams();
        }
    };

    const fetchUpcomingExams = async () => {
        try {
            const data = await api.get('/api/calendar/exams');
            console.log('📅 Fetched exams:', data);
            if (data.exams && data.exams.length > 0) {
                setUpcomingExams(data.exams);
            }
        } catch (err) {
            console.error('Exams error:', err);
        }
    };

    const connectCalendar = async () => {
        console.log('🔗 Connect Calendar button clicked');
        setConnectingCalendar(true);
        
        try {
            console.log('📡 Fetching auth URL...');
            const data = await api.get('/api/calendar/auth-url');
            console.log('📡 Response:', data);
            
            // Check for both 'url' and 'authUrl' field names
            const authUrl = data.url || data.authUrl;
            
            if (authUrl) {
                console.log('🔗 Redirecting to:', authUrl);
                window.location.href = authUrl;
            } else {
                console.error('No URL in response:', data);
                showToast('Failed to get authentication URL', 'error');
            }
        } catch (err) {
            console.error('Connect calendar error:', err);
            showToast(err.message || 'Failed to connect calendar', 'error');
        } finally {
            setConnectingCalendar(false);
        }
    };

    const syncCalendar = async () => {
        console.log('🔄 Sync button clicked');
        setSyncing(true);
        
        try {
            const data = await api.post('/api/calendar/sync');
            console.log('Sync response:', data);
            
            if (data.exams) {
                setUpcomingExams(data.exams);
                showToast(`Synced! Found ${data.exams.length} upcoming exams`, 'success');
            } else {
                showToast('Calendar synced successfully', 'success');
            }
        } catch (err) {
            console.error('Sync error:', err);
            showToast(err.message || 'Failed to sync calendar', 'error');
        } finally {
            setSyncing(false);
        }
    };

    const disconnectCalendar = async () => {
        try {
            await api.post('/api/calendar/disconnect');
            setCalendarConnected(false);
            setUpcomingExams([]);
            showToast('Calendar disconnected', 'success');
        } catch (err) {
            showToast('Failed to disconnect calendar', 'error');
        }
    };

    const addManualExam = async () => {
        if (!manualExam.title || !manualExam.date) {
            showToast('Please fill in title and date', 'error');
            return;
        }
        
        try {
            const data = await api.post('/api/calendar/exams/manual', manualExam);
            setUpcomingExams(prev => [...prev, data.exam].sort((a, b) => new Date(a.date) - new Date(b.date)));
            setShowManualExamModal(false);
            setManualExam({ title: '', date: '', moduleCode: '', description: '' });
            showToast('Exam added successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to add exam', 'error');
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const getDaysUntil = (dateStr) => {
        const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const getUrgencyColor = (days) => {
        if (days <= 3) return 'from-red-500 to-rose-600';
        if (days <= 7) return 'from-orange-500 to-amber-600';
        if (days <= 14) return 'from-yellow-500 to-amber-500';
        return 'from-green-500 to-emerald-600';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate earned achievements based on stats
    const getEarnedAchievements = () => {
        const earned = [];
        
        if (stats.totalNotes >= 1) earned.push('first_upload');
        if (stats.totalNotes >= 5) earned.push('five_notes');
        if (stats.totalNotes >= 10) earned.push('ten_notes');
        if (stats.totalQuizzesTaken >= 1) earned.push('first_quiz');
        if (stats.totalQuizzesTaken >= 10) earned.push('quiz_master');
        if (stats.currentStreak >= 3) earned.push('streak_3');
        if (stats.currentStreak >= 7) earned.push('streak_7');
        if (stats.currentStreak >= 30) earned.push('streak_30');
        if (stats.flashcardsReviewed >= 100) earned.push('flashcard_100');
        if (stats.averageScore === 100) earned.push('perfect_score');
        
        return earned;
    };

    const earnedAchievementIds = getEarnedAchievements();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${
                    toast.type === 'success' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{toast.type === 'success' ? '✓' : '✕'}</span>
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">
                                    Welcome back, {user?.firstName || 'Student'}! 👋
                                </h1>
                                <p className="text-white/80 text-lg">
                                    {stats.currentStreak > 0 
                                        ? `🔥 You're on a ${stats.currentStreak} day streak! Keep it up!`
                                        : "Ready to continue your learning journey?"
                                    }
                                </p>
                            </div>
                            <Link
                                to="/user/notes/upload"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload Notes
                            </Link>
                        </div>

                        {/* Streak and Weekly Progress */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🔥</span>
                                    <div>
                                        <p className="text-3xl font-bold">{stats.currentStreak}</p>
                                        <p className="text-sm text-white/70">Day Streak</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🏆</span>
                                    <div>
                                        <p className="text-3xl font-bold">{stats.longestStreak || stats.currentStreak}</p>
                                        <p className="text-sm text-white/70">Best Streak</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">📈</span>
                                    <div>
                                        <p className="text-3xl font-bold">{stats.weeklyProgress || 0}/{stats.weeklyGoal || 5}</p>
                                        <p className="text-sm text-white/70">Weekly Goal</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">⭐</span>
                                    <div>
                                        <p className="text-3xl font-bold">{earnedAchievementIds.length}</p>
                                        <p className="text-sm text-white/70">Achievements</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left 2 Columns */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard 
                                icon="📄" 
                                value={stats.totalNotes} 
                                label="Total Notes" 
                                gradient="from-blue-500 to-cyan-500"
                            />
                            <StatCard 
                                icon="📝" 
                                value={stats.totalMCQs} 
                                label="MCQs Generated" 
                                gradient="from-purple-500 to-pink-500"
                            />
                            <StatCard 
                                icon="🎴" 
                                value={stats.totalFlashCards} 
                                label="Flash Cards" 
                                gradient="from-orange-500 to-red-500"
                            />
                            <StatCard 
                                icon="✅" 
                                value={stats.totalQuizzesTaken} 
                                label="Quizzes Taken" 
                                gradient="from-green-500 to-emerald-500"
                            />
                            <StatCard 
                                icon="🎯" 
                                value={`${stats.averageScore || 0}%`} 
                                label="Avg Score" 
                                gradient="from-indigo-500 to-purple-500"
                            />
                            <StatCard 
                                icon="📅" 
                                value={upcomingExams.length} 
                                label="Upcoming Exams" 
                                gradient="from-rose-500 to-pink-500"
                            />
                        </div>

                        {/* Upcoming Exams */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="text-3xl">📅</span>
                                    Upcoming Exams
                                </h2>
                                <button
                                    onClick={() => setShowManualExamModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
                                >
                                    + Add Exam
                                </button>
                            </div>

                            {upcomingExams.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingExams.map((exam, index) => {
                                        const days = getDaysUntil(exam.date);
                                        return (
                                            <div key={index} className={`bg-gradient-to-r ${getUrgencyColor(days)} rounded-2xl p-5 text-white relative overflow-hidden`}>
                                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {exam.moduleCode && (
                                                                    <span className="px-2 py-0.5 bg-white/20 rounded-lg text-xs font-medium">
                                                                        {exam.moduleCode}
                                                                    </span>
                                                                )}
                                                                {exam.isManual && (
                                                                    <span className="px-2 py-0.5 bg-white/20 rounded-lg text-xs">
                                                                        ✏️ Manual
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h3 className="text-xl font-bold">{exam.title}</h3>
                                                            <p className="text-white/80 mt-1">
                                                                {formatDate(exam.date)}
                                                                {exam.relatedNotes > 0 && (
                                                                    <span className="ml-3">📚 {exam.relatedNotes} notes</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-4xl font-bold">{days}</div>
                                                            <div className="text-sm text-white/80">days left</div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/user/exam-prep/${index}`}
                                                        onClick={() => sessionStorage.setItem('currentExam', JSON.stringify(exam))}
                                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all"
                                                    >
                                                        🚀 Start Exam Prep
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                    <span className="text-6xl mb-4 block">📅</span>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming exams</h3>
                                    <p className="text-gray-500 mb-4">
                                        {calendarConnected 
                                            ? "Sync your calendar or add exams manually"
                                            : "Connect your calendar to auto-detect exams"
                                        }
                                    </p>
                                    <button
                                        onClick={() => setShowManualExamModal(true)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        + Add Exam Manually
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Achievements Section */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                Achievements
                                <span className="text-sm font-normal text-gray-500">
                                    ({earnedAchievementIds.length}/{allAchievements.length})
                                </span>
                            </h2>
                            
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {allAchievements.map((achievement) => {
                                    const earned = earnedAchievementIds.includes(achievement.id);
                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`relative group p-4 rounded-2xl text-center transition-all ${
                                                earned 
                                                    ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300' 
                                                    : 'bg-gray-100 opacity-50 grayscale'
                                            }`}
                                        >
                                            <span className="text-4xl block mb-2">{achievement.icon}</span>
                                            <p className="text-xs font-medium text-gray-700 truncate">{achievement.title}</p>
                                            
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {achievement.description}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Notes */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="text-3xl">📚</span>
                                    Recent Notes
                                </h2>
                                <Link to="/user/notes/list" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                    View All →
                                </Link>
                            </div>

                            {recentNotes.length > 0 ? (
                                <div className="space-y-3">
                                    {recentNotes.map((note) => (
                                        <Link
                                            key={note.id}
                                            to={`/user/notes/${note.id}`}
                                            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xl">📄</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {note.moduleCode && (
                                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                            {note.moduleCode}
                                                        </span>
                                                    )}
                                                    <h3 className="font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                        {note.fileName?.replace('.pdf', '')}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    <span>📝 {note.stats?.mcqCount || 0} MCQs</span>
                                                    <span>🎴 {note.stats?.flashCardCount || 0} Cards</span>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                    <span className="text-6xl mb-4 block">📚</span>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
                                    <p className="text-gray-500 mb-4">Upload your first lecture note to get started</p>
                                    <Link
                                        to="/user/notes/upload"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Upload Notes
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        {/* Calendar Connection */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-2xl">📅</span>
                                Google Calendar
                            </h3>
                            
                            {calendarConnected ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800">Connected</p>
                                            <p className="text-sm text-green-600">Auto-detecting exams</p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={syncCalendar}
                                        disabled={syncing}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {syncing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Syncing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Sync Now
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={disconnectCalendar}
                                        className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm"
                                    >
                                        Disconnect Calendar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-gray-600 text-sm">
                                        Connect your Google Calendar to automatically detect upcoming exams and generate study materials.
                                    </p>
                                    <button
                                        onClick={connectCalendar}
                                        disabled={connectingCalendar}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {connectingCalendar ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                </svg>
                                                Connect Calendar
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-2xl">⚡</span>
                                Quick Actions
                            </h3>
                            
                            <div className="space-y-3">
                                <Link
                                    to="/user/notes/upload"
                                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl transition-all group"
                                >
                                    <span className="text-2xl">📤</span>
                                    <span className="font-medium text-gray-900 group-hover:text-indigo-600">Upload Notes</span>
                                </Link>
                                
                                <Link
                                    to="/user/notes/list"
                                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all group"
                                >
                                    <span className="text-2xl">📚</span>
                                    <span className="font-medium text-gray-900 group-hover:text-green-600">My Notes</span>
                                </Link>
                                
                                <button
                                    onClick={() => setShowManualExamModal(true)}
                                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-2xl transition-all group"
                                >
                                    <span className="text-2xl">📅</span>
                                    <span className="font-medium text-gray-900 group-hover:text-orange-600">Add Exam Date</span>
                                </button>
                                
                                {recentNotes.length > 0 && (
                                    <Link
                                        to={`/user/notes/${recentNotes[0].id}`}
                                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-2xl transition-all group"
                                    >
                                        <span className="text-2xl">🎯</span>
                                        <span className="font-medium text-gray-900 group-hover:text-pink-600">Continue Studying</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Study Tips */}
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-xl p-6 text-white">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-2xl">💡</span>
                                Study Tip
                            </h3>
                            <p className="text-white/90 leading-relaxed">
                                {[
                                    "Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break.",
                                    "Active recall is more effective than passive reading. Test yourself frequently using flashcards and MCQs!",
                                    "Teaching others what you've learned is one of the best ways to reinforce your understanding.",
                                    "Space out your studying over time. Cramming is less effective than distributed practice.",
                                    "Review your flashcards just before sleeping - your brain consolidates memories during sleep!",
                                    "Mix up different topics in one study session. Interleaving improves long-term retention.",
                                    "Take handwritten notes when possible - it engages different parts of your brain than typing."
                                ][Math.floor(Math.random() * 7)]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Exam Modal */}
            {showManualExamModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="text-3xl">📅</span>
                            Add Exam Manually
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Exam Title *
                                </label>
                                <input
                                    type="text"
                                    value={manualExam.title}
                                    onChange={(e) => setManualExam(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Data Structures Final Exam"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={manualExam.date}
                                    onChange={(e) => setManualExam(prev => ({ ...prev, date: e.target.value }))}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Module Code
                                    <span className="font-normal text-gray-500 ml-2">(for linking notes)</span>
                                </label>
                                <input
                                    type="text"
                                    value={manualExam.moduleCode}
                                    onChange={(e) => setManualExam(prev => ({ ...prev, moduleCode: e.target.value.toUpperCase() }))}
                                    placeholder="e.g., IT3010"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This helps us find your related notes for exam prep
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                    <span className="font-normal text-gray-500 ml-2">(optional)</span>
                                </label>
                                <textarea
                                    value={manualExam.description}
                                    onChange={(e) => setManualExam(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Any additional notes..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setShowManualExamModal(false);
                                    setManualExam({ title: '', date: '', moduleCode: '', description: '' });
                                }}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addManualExam}
                                disabled={!manualExam.title || !manualExam.date}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Stat Card Component
const StatCard = ({ icon, value, label, gradient }) => (
    <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    </div>
);
