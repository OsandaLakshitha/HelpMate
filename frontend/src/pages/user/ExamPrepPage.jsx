// src/pages/user/ExamPrepPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function ExamPrepPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    
    const [exam, setExam] = useState(null);
    const [relatedNotes, setRelatedNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Combined study materials
    const [allMcqs, setAllMcqs] = useState([]);
    const [allFlashcards, setAllFlashcards] = useState([]);
    const [allKeyPoints, setAllKeyPoints] = useState([]);
    
    // Active tab
    const [activeTab, setActiveTab] = useState('overview');
    
    // MCQ Quiz state
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    
    // Flashcard state
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState(new Set());
    const [learningCards, setLearningCards] = useState(new Set());

    useEffect(() => {
        fetchExamData();
    }, [examId]);

    const fetchExamData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📚 Fetching exam data for examId:', examId);
            
            // Method 1: Try to get exams from calendar endpoint
            let exams = [];
            try {
                const calendarData = await api.get('/api/calendar/exams');
                console.log('📅 Calendar exams:', calendarData);
                exams = calendarData.exams || [];
            } catch (e) {
                console.log('Calendar exams failed, trying user data...');
            }
            
            // Method 2: If no calendar exams, try user's upcomingExams
            if (exams.length === 0) {
                try {
                    const userData = await api.get('/api/auth/me');
                    console.log('👤 User data:', userData);
                    exams = userData.user?.upcomingExams || userData.upcomingExams || [];
                } catch (e) {
                    console.log('User data failed:', e);
                }
            }
            
            // Method 3: Try dashboard stats which might have exams
            if (exams.length === 0) {
                try {
                    const statsData = await api.get('/api/notes/stats');
                    console.log('📊 Stats data:', statsData);
                    // Stats might not have exams, that's okay
                } catch (e) {
                    console.log('Stats failed:', e);
                }
            }
            
            console.log('📋 Total exams found:', exams.length);
            
            // Parse examId - could be index or actual ID
            let currentExam = null;
            const examIndex = parseInt(examId);
            
            if (!isNaN(examIndex) && exams[examIndex]) {
                // examId is an index
                currentExam = exams[examIndex];
                console.log('✅ Found exam by index:', currentExam);
            } else {
                // examId might be an actual ID
                currentExam = exams.find(e => e._id === examId || e.id === examId);
                console.log('✅ Found exam by ID:', currentExam);
            }
            
            // If still no exam, check if examId contains exam data in URL state
            if (!currentExam && exams.length > 0) {
                currentExam = exams[0]; // Default to first exam
                console.log('⚠️ Defaulting to first exam:', currentExam);
            }
            
            if (!currentExam) {
                // Create a dummy exam for testing if no exams exist
                console.log('❌ No exam found, checking for manual exam in localStorage...');
                
                // Check if we have exam data passed via state
                const storedExam = sessionStorage.getItem('currentExam');
                if (storedExam) {
                    currentExam = JSON.parse(storedExam);
                    console.log('✅ Found exam in sessionStorage:', currentExam);
                }
            }
            
            if (!currentExam) {
                setError('Exam not found. Please go back to dashboard and select an exam.');
                setLoading(false);
                return;
            }
            
            setExam(currentExam);
            
            // Fetch all user's notes
            const notesData = await api.get('/api/notes/list');
            const allNotes = notesData.notes || [];
            console.log('📚 Total notes:', allNotes.length);
            
            // Find related notes by module code or title keywords
            const moduleCode = currentExam.moduleCode || '';
            const examTitle = currentExam.title || currentExam.summary || '';
            
            console.log('🔍 Searching for moduleCode:', moduleCode, 'or keywords in:', examTitle);
            
            let matchedNotes = [];
            
            // Match by module code first
            if (moduleCode) {
                matchedNotes = allNotes.filter(note => 
                    note.moduleCode?.toLowerCase() === moduleCode.toLowerCase()
                );
                console.log('📌 Notes matched by moduleCode:', matchedNotes.length);
            }
            
            // If no match by module code, try matching by keywords in title
            if (matchedNotes.length === 0 && examTitle) {
                const keywords = examTitle.toLowerCase()
                    .replace(/exam|test|quiz|final|midterm|assignment/gi, '')
                    .split(/\s+/)
                    .filter(w => w.length > 2);
                
                console.log('🔑 Keywords:', keywords);
                
                matchedNotes = allNotes.filter(note => {
                    const noteText = `${note.fileName} ${note.moduleName} ${note.moduleCode}`.toLowerCase();
                    return keywords.some(keyword => noteText.includes(keyword));
                });
                console.log('📌 Notes matched by keywords:', matchedNotes.length);
            }
            
            // If still no match, use all notes
            if (matchedNotes.length === 0) {
                matchedNotes = allNotes.slice(0, 5); // Use recent 5 notes
                console.log('📌 Using recent notes:', matchedNotes.length);
            }
            
            setRelatedNotes(matchedNotes);
            
            // Fetch full content for each related note
            const mcqs = [];
            const flashcards = [];
            const keyPoints = [];
            
            for (const note of matchedNotes) {
                try {
                    const fullNote = await api.get(`/api/notes/${note.id}`);
                    const noteData = fullNote.note || fullNote;
                    
                    // Collect MCQs
                    if (noteData.mcqs && noteData.mcqs.length > 0) {
                        mcqs.push(...noteData.mcqs.map(mcq => ({
                            ...mcq,
                            sourceNote: note.fileName
                        })));
                    }
                    
                    // Collect Flashcards
                    if (noteData.flashCards && noteData.flashCards.length > 0) {
                        flashcards.push(...noteData.flashCards.map(card => ({
                            ...card,
                            sourceNote: note.fileName
                        })));
                    }
                    
                    // Collect Key Points from short notes
                    if (noteData.shortNotes?.sections) {
                        noteData.shortNotes.sections.forEach(section => {
                            if (section.items) {
                                keyPoints.push(...section.items.map(item => ({
                                    text: item,
                                    section: section.title,
                                    sourceNote: note.fileName
                                })));
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error fetching note:', note.id, e);
                }
            }
            
            // Shuffle and limit
            const shuffledMcqs = shuffleArray([...mcqs]).slice(0, 50);
            const shuffledFlashcards = shuffleArray([...flashcards]).slice(0, 30);
            
            console.log('📝 Total MCQs:', shuffledMcqs.length);
            console.log('🎴 Total Flashcards:', shuffledFlashcards.length);
            console.log('📋 Total Key Points:', keyPoints.length);
            
            setAllMcqs(shuffledMcqs);
            setAllFlashcards(shuffledFlashcards);
            setAllKeyPoints(keyPoints);
            
        } catch (err) {
            console.error('Error fetching exam data:', err);
            setError(err.message || 'Failed to load exam data');
        } finally {
            setLoading(false);
        }
    };

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleAnswerSelect = (answer) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    };

    const calculateScore = () => {
        let correct = 0;
        allMcqs.forEach((mcq, index) => {
            if (userAnswers[index] === mcq.answer) correct++;
        });
        return correct;
    };

    const getDaysUntilExam = () => {
        if (!exam?.date) return null;
        const examDate = new Date(exam.date);
        const today = new Date();
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntil = getDaysUntilExam();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam prep materials...</p>
                </div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Exam Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The exam you\'re looking for doesn\'t exist or has been removed.'}</p>
                    <Link
                        to="/user/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'mcq', label: `MCQs (${allMcqs.length})`, icon: '📝' },
        { id: 'flashcards', label: `Flashcards (${allFlashcards.length})`, icon: '🎴' },
        { id: 'keypoints', label: `Key Points (${allKeyPoints.length})`, icon: '📚' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                    <Link to="/user/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {exam.moduleCode && (
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                                        {exam.moduleCode}
                                    </span>
                                )}
                                {daysUntil !== null && (
                                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                        daysUntil <= 3 ? 'bg-red-100 text-red-700' :
                                        daysUntil <= 7 ? 'bg-orange-100 text-orange-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {daysUntil === 0 ? 'Today!' :
                                         daysUntil === 1 ? 'Tomorrow' :
                                         daysUntil < 0 ? 'Passed' :
                                         `${daysUntil} days left`}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {exam.title || exam.summary || 'Exam Preparation'}
                            </h1>
                            {exam.date && (
                                <p className="text-gray-600 mt-1">
                                    📅 {new Date(exam.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl">
                                <p className="text-2xl font-bold text-indigo-600">{relatedNotes.length}</p>
                                <p className="text-xs text-gray-600">Notes</p>
                            </div>
                            <div className="text-center px-4 py-2 bg-purple-50 rounded-xl">
                                <p className="text-2xl font-bold text-purple-600">{allMcqs.length}</p>
                                <p className="text-xs text-gray-600">MCQs</p>
                            </div>
                            <div className="text-center px-4 py-2 bg-pink-50 rounded-xl">
                                <p className="text-2xl font-bold text-pink-600">{allFlashcards.length}</p>
                                <p className="text-xs text-gray-600">Cards</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Exam Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Exam Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Subject</p>
                                        <p className="font-medium">{exam.title || exam.summary || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Module Code</p>
                                        <p className="font-medium">{exam.moduleCode || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">{exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Source</p>
                                        <p className="font-medium">{exam.source === 'manual' ? '✏️ Manual' : '📅 Calendar'}</p>
                                    </div>
                                </div>
                                {exam.description && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Description</p>
                                        <p className="font-medium">{exam.description}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Related Notes */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Related Notes ({relatedNotes.length})</h3>
                                {relatedNotes.length > 0 ? (
                                    <div className="space-y-3">
                                        {relatedNotes.map((note, idx) => (
                                            <Link
                                                key={idx}
                                                to={`/user/notes/${note.id}`}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                        📄
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{note.fileName?.replace('.pdf', '')}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {note.stats?.mcqCount || 0} MCQs • {note.stats?.flashCardCount || 0} Cards
                                                        </p>
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No related notes found.</p>
                                        <Link to="/user/notes/upload" className="text-indigo-600 hover:underline">
                                            Upload notes for this subject
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('mcq')}
                                        className="w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                                    >
                                        📝 Start MCQ Practice
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('flashcards')}
                                        className="w-full p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                                    >
                                        🎴 Review Flashcards
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('keypoints')}
                                        className="w-full p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                                    >
                                        📚 Study Key Points
                                    </button>
                                </div>
                            </div>
                            
                            {/* Study Tips */}
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Study Tips</h3>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">✓</span>
                                        <span>Start with flashcards to warm up</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">✓</span>
                                        <span>Practice MCQs under timed conditions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">✓</span>
                                        <span>Review wrong answers carefully</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">✓</span>
                                        <span>Take breaks every 25 minutes</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* MCQ Tab */}
                {activeTab === 'mcq' && (
                    <div className="space-y-6">
                        {allMcqs.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    📝
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No MCQs Available</h3>
                                <p className="text-gray-600">Upload notes related to this exam to generate MCQs.</p>
                            </div>
                        ) : !quizStarted ? (
                            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl">📝</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">MCQ Practice</h2>
                                <p className="text-gray-600 mb-6">{allMcqs.length} questions from {relatedNotes.length} notes</p>
                                <button
                                    onClick={() => setQuizStarted(true)}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
                                >
                                    Start Practice
                                </button>
                            </div>
                        ) : quizCompleted ? (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {/* Results */}
                                <div className={`p-8 text-center text-white ${
                                    (calculateScore() / allMcqs.length) >= 0.8 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                    (calculateScore() / allMcqs.length) >= 0.6 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                                    'bg-gradient-to-r from-orange-500 to-red-600'
                                }`}>
                                    <h2 className="text-2xl font-bold mb-4">Practice Complete!</h2>
                                    <div className="text-6xl font-bold mb-2">
                                        {Math.round((calculateScore() / allMcqs.length) * 100)}%
                                    </div>
                                    <p className="text-xl">{calculateScore()} / {allMcqs.length} correct</p>
                                </div>
                                
                                <div className="p-6 flex gap-4 justify-center">
                                    <button
                                        onClick={() => setShowReview(true)}
                                        className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200"
                                    >
                                        Review Answers
                                    </button>
                                    <button
                                        onClick={() => {
                                            setQuizStarted(false);
                                            setQuizCompleted(false);
                                            setUserAnswers({});
                                            setCurrentQuestion(0);
                                            setShowReview(false);
                                            setAllMcqs(shuffleArray([...allMcqs]));
                                        }}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                                    >
                                        Try Again
                                    </button>
                                </div>
                                
                                {/* Review */}
                                {showReview && (
                                    <div className="border-t p-6 max-h-96 overflow-y-auto">
                                        {allMcqs.map((mcq, idx) => {
                                            const isCorrect = userAnswers[idx] === mcq.answer;
                                            return (
                                                <div key={idx} className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                            {isCorrect ? '✓' : '✗'}
                                                        </span>
                                                        <p className="font-medium">{mcq.question}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-600 ml-8">
                                                        Your answer: {userAnswers[idx] || 'Not answered'} | 
                                                        Correct: {mcq.answer}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Question {currentQuestion + 1} of {allMcqs.length}</span>
                                        <span>{Object.keys(userAnswers).length} answered</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                            style={{ width: `${((currentQuestion + 1) / allMcqs.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Question */}
                                <div className="mb-6">
                                    <p className="text-lg font-medium text-gray-900 mb-4">
                                        {allMcqs[currentQuestion]?.question}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-4">
                                        From: {allMcqs[currentQuestion]?.sourceNote}
                                    </p>
                                    
                                    <div className="space-y-3">
                                        {allMcqs[currentQuestion]?.options?.map((opt, idx) => {
                                            const optionKey = opt[0];
                                            const isSelected = userAnswers[currentQuestion] === optionKey;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(optionKey)}
                                                    className={`w-full p-4 rounded-xl text-left transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-100 border-2 border-indigo-500'
                                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                    }`}
                                                >
                                                    <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                                        isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                                                    }`}>
                                                        {optionKey}
                                                    </span>
                                                    {opt.substring(2).trim()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* Navigation */}
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                        disabled={currentQuestion === 0}
                                        className="px-6 py-3 bg-gray-100 rounded-xl disabled:opacity-50"
                                    >
                                        ← Previous
                                    </button>
                                    
                                    {currentQuestion === allMcqs.length - 1 ? (
                                        <button
                                            onClick={() => setQuizCompleted(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
                                        >
                                            Finish Quiz
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
                                        >
                                            Next →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Flashcards Tab */}
                {activeTab === 'flashcards' && (
                    <div className="space-y-6">
                        {allFlashcards.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    🎴
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Flashcards Available</h3>
                                <p className="text-gray-600">Upload notes related to this exam to generate flashcards.</p>
                            </div>
                        ) : (
                            <>
                                {/* Progress */}
                                <div className="bg-white rounded-2xl shadow-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">
                                            Card {currentCard + 1} of {allFlashcards.length}
                                        </span>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-green-600">✓ Known: {knownCards.size}</span>
                                            <span className="text-orange-600">📖 Learning: {learningCards.size}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                                            style={{ width: `${((currentCard + 1) / allFlashcards.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Flashcard */}
                                <div 
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className="relative h-80 cursor-pointer perspective-1000"
                                    style={{ perspective: '1000px' }}
                                >
                                    <div 
                                        className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                                        style={{ 
                                            transformStyle: 'preserve-3d',
                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                        }}
                                    >
                                        {/* Front */}
                                        <div 
                                            className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm mb-4">
                                                Question
                                            </span>
                                            <p className="text-2xl font-medium text-gray-900 text-center">
                                                {allFlashcards[currentCard]?.front}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-4">
                                                From: {allFlashcards[currentCard]?.sourceNote}
                                            </p>
                                            <p className="text-gray-400 mt-4 text-sm">Click to flip</p>
                                        </div>
                                        
                                        {/* Back */}
                                        <div 
                                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-white backface-hidden rotate-y-180"
                                            style={{ 
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)'
                                            }}
                                        >
                                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                                                Answer
                                            </span>
                                            <p className="text-2xl font-medium text-center">
                                                {allFlashcards[currentCard]?.back}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Controls */}
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLearningCards(prev => new Set([...prev, currentCard]));
                                            setKnownCards(prev => { const n = new Set(prev); n.delete(currentCard); return n; });
                                            if (currentCard < allFlashcards.length - 1) {
                                                setCurrentCard(currentCard + 1);
                                                setIsFlipped(false);
                                            }
                                        }}
                                        className="px-6 py-3 bg-orange-100 text-orange-700 rounded-xl font-medium hover:bg-orange-200"
                                    >
                                        📖 Still Learning
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setKnownCards(prev => new Set([...prev, currentCard]));
                                            setLearningCards(prev => { const n = new Set(prev); n.delete(currentCard); return n; });
                                            if (currentCard < allFlashcards.length - 1) {
                                                setCurrentCard(currentCard + 1);
                                                setIsFlipped(false);
                                            }
                                        }}
                                        className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200"
                                    >
                                        ✓ Got It!
                                    </button>
                                </div>
                                
                                {/* Navigation */}
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setIsFlipped(false); }}
                                        disabled={currentCard === 0}
                                        className="px-6 py-3 bg-white rounded-xl shadow disabled:opacity-50"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAllFlashcards(shuffleArray([...allFlashcards]));
                                            setCurrentCard(0);
                                            setIsFlipped(false);
                                        }}
                                        className="px-6 py-3 bg-purple-100 text-purple-700 rounded-xl"
                                    >
                                        🔀 Shuffle
                                    </button>
                                    <button
                                        onClick={() => { setCurrentCard(Math.min(allFlashcards.length - 1, currentCard + 1)); setIsFlipped(false); }}
                                        disabled={currentCard === allFlashcards.length - 1}
                                        className="px-6 py-3 bg-white rounded-xl shadow disabled:opacity-50"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Key Points Tab */}
                {activeTab === 'keypoints' && (
                    <div className="space-y-6">
                        {allKeyPoints.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    📚
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Key Points Available</h3>
                                <p className="text-gray-600">Upload notes related to this exam to generate key points.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    📚 Key Points ({allKeyPoints.length})
                                </h3>
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {allKeyPoints.map((point, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-gray-900">{point.text}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {point.section} • From: {point.sourceNote}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
