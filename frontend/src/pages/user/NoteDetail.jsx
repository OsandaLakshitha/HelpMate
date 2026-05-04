// src/pages/user/NoteDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function NoteDetail() {
    const { id } = useParams();
    const location = useLocation();
    
    const [note, setNote] = useState(location.state?.note || null);
    const [mcqs, setMcqs] = useState(location.state?.mcqs || []);
    const [shortNotes, setShortNotes] = useState(location.state?.shortNotes || null);
    const [flashCards, setFlashCards] = useState(location.state?.flashCards || []);
    const [loading, setLoading] = useState(!location.state);
    
    const [activeTab, setActiveTab] = useState('mcq');
    
    // Quiz state
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [reviewMode, setReviewMode] = useState(false);
    const [reviewFilter, setReviewFilter] = useState('all');
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [quizDuration, setQuizDuration] = useState(0);
    
    // Flash card state
    // Flash card state
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState(new Set());
    const [learningCards, setLearningCards] = useState(new Set());
    const [shuffledCards, setShuffledCards] = useState([]);
    const [showCompletion, setShowCompletion] = useState(false);

    // Regenerate state
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [regenerateType, setRegenerateType] = useState('all');
    const [regenerateMcqCount, setRegenerateMcqCount] = useState(20);
    const [regenerateFlashcardCount, setRegenerateFlashcardCount] = useState(15);

    useEffect(() => {
        if (!location.state) {
            fetchNote();
        }
    }, [id]);

    useEffect(() => {
        if (flashCards.length > 0) {
            setShuffledCards([...flashCards]);
        }
    }, [flashCards]);

    // Keyboard navigation for flashcards
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (activeTab !== 'cards' || shuffledCards.length === 0) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    prevCard();
                    break;
                case 'ArrowRight':
                    nextCard();
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    setIsFlipped(!isFlipped);
                    break;
                case 'ArrowUp':
                    markAsKnown();
                    break;
                case 'ArrowDown':
                    markAsLearning();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [activeTab, currentCardIndex, isFlipped, shuffledCards]);

    const fetchNote = async () => {
        try {
            const data = await api.get(`/api/notes/${id}`);
            if (data.note) {
                setNote(data.note);
                setMcqs(data.note.mcqs || []);
                setShortNotes(data.note.shortNotes || null);
                setFlashCards(data.note.flashCards || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Quiz functions
    const startQuiz = () => {
        setQuizStarted(true);
        setQuizStartTime(Date.now());
        setCurrentQuestion(0);
        setUserAnswers({});
        setShowResults(false);
        setReviewMode(false);
    };

    const handleAnswerSelect = (answer) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    };

    const goToQuestion = (index) => {
        setCurrentQuestion(index);
    };

    const handleQuizSubmit = async () => {
        const endTime = Date.now();
        setQuizDuration(Math.round((endTime - quizStartTime) / 1000));
        
        let correct = 0;
        mcqs.forEach((mcq, i) => {
            if (userAnswers[i] === mcq.answer) correct++;
        });
        setScore(correct);
        setShowResults(true);
        setShowResults(true);
        
        // Save attempt
        try {
            await api.post(`/api/notes/${id}/quiz-attempt`, {
                score: correct,
                totalQuestions: mcqs.length
            });
        } catch (err) {
            console.error(err);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setUserAnswers({});
        setShowResults(false);
        setShowResults(false);
        setScore(0);
        setReviewMode(false);
        setCurrentQuestion(0);
    };

    // Flashcard functions
    const nextCard = () => {
        if (currentCardIndex < shuffledCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        } else if (knownCards.size + learningCards.size === shuffledCards.length) {
            setShowCompletion(true);
        }
    };

    const prevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const markAsKnown = () => {
        setKnownCards(prev => new Set([...prev, currentCardIndex]));
        setLearningCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentCardIndex);
            return newSet;
        });
        nextCard();
    };

    const markAsLearning = () => {
        setLearningCards(prev => new Set([...prev, currentCardIndex]));
        setKnownCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentCardIndex);
            return newSet;
        });
        nextCard();
    };

    const shuffleCards = () => {
        const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
        setShuffledCards(shuffled);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
        setLearningCards(new Set());
        setShowCompletion(false);
    };

    const resetCards = () => {
        setShuffledCards([...flashCards]);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
        setLearningCards(new Set());
        setShowCompletion(false);
    };

    // Regenerate functions
    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            let endpoint = `/api/notes/${id}/regenerate-all`;
            let body = {
                numQuestions: regenerateMcqCount,
                numFlashCards: regenerateFlashcardCount
            };

            if (regenerateType === 'mcqs') {
                endpoint = `/api/notes/${id}/regenerate-mcqs`;
                body = { numQuestions: regenerateMcqCount };
            } else if (regenerateType === 'flashcards') {
                endpoint = `/api/notes/${id}/regenerate-flashcards`;
                body = { numFlashCards: regenerateFlashcardCount };
            } else if (regenerateType === 'notes') {
                endpoint = `/api/notes/${id}/regenerate-notes`;
                body = {};
            }

            const data = await api.post(endpoint, body);
            
            if (data.mcqs) setMcqs(data.mcqs);
            if (data.flashCards) {
                setFlashCards(data.flashCards);
                setShuffledCards(data.flashCards);
            }
            if (data.shortNotes) setShortNotes(data.shortNotes);
            if (data.note?.stats) {
                setNote(prev => ({ ...prev, stats: data.note.stats }));
            }

            setShowRegenerateModal(false);
            resetQuiz();
            resetCards();
        } catch (err) {
            console.error('Regenerate error:', err);
            alert('Failed to regenerate: ' + err.message);
        } finally {
            setRegenerating(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading note...</p>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="text-6xl mb-4">📄</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Note not found</h2>
                    <Link to="/user/notes/list" className="text-indigo-600 hover:underline">← Back to My Notes</Link>
                </div>
            </div>
        );
    }

    const percentage = mcqs.length > 0 ? Math.round((score / mcqs.length) * 100) : 0;
    const currentCard = shuffledCards[currentCardIndex];
    const cardProgress = shuffledCards.length > 0 ? ((currentCardIndex + 1) / shuffledCards.length) * 100 : 0;

    const tabs = [
        { id: 'mcq', label: 'MCQ Quiz', icon: '📝', count: mcqs.length },
        { id: 'notes', label: 'Short Notes', icon: '📋', count: shortNotes?.totalPoints || 0 },
        { id: 'cards', label: 'Flash Cards', icon: '🎴', count: flashCards.length }
    ];

    const getFilteredReviewQuestions = () => {
        if (reviewFilter === 'all') return mcqs.map((q, i) => ({ ...q, index: i }));
        if (reviewFilter === 'correct') return mcqs.map((q, i) => ({ ...q, index: i })).filter(q => userAnswers[q.index] === q.answer);
        if (reviewFilter === 'incorrect') return mcqs.map((q, i) => ({ ...q, index: i })).filter(q => userAnswers[q.index] !== q.answer);
        return mcqs.map((q, i) => ({ ...q, index: i }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link to="/user/notes/list" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to My Notes
                        </Link>
                        <button
                            onClick={() => setShowRegenerateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Regenerate
                        </button>
                    </div>
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {note.moduleCode && (
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                                        {note.moduleCode}
                                    </span>
                                )}
                                {note.tags?.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {note.fileName?.replace('.pdf', '')}
                            </h1>
                            {note.moduleName && <p className="text-gray-600 mt-1">{note.moduleName}</p>}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* MCQ Tab */}
                {/* MCQ Tab */}
                {activeTab === 'mcq' && (
                    <div className="space-y-6">
                        {mcqs.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No MCQs Generated</h3>
                                <p className="text-gray-600 mb-6">Click the Regenerate button to generate MCQs from this note.</p>
                                <button
                                    onClick={() => { setRegenerateType('mcqs'); setShowRegenerateModal(true); }}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                                >
                                    Generate MCQs
                                </button>
                            </div>
                        ) : !quizStarted ? (
                            /* Start Screen */
                            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">🎯</div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Test Your Knowledge?</h2>
                                <p className="text-gray-600 mb-2">This quiz contains {mcqs.length} questions</p>
                                <p className="text-gray-500 text-sm mb-8">Answer all questions and see your results with detailed review</p>
                                <button
                                    onClick={startQuiz}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                                >
                                    Start Quiz
                                </button>
                            </div>
                        ) : showResults ? (
                            /* Results Screen */
                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                                    <div className={`p-8 text-center text-white ${
                                        percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                        percentage >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                                        percentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                                        'bg-gradient-to-r from-red-500 to-rose-600'
                                    }`}>
                                        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
                                        <div className="relative w-40 h-40 mx-auto mb-4">
                                            <svg className="w-40 h-40 transform -rotate-90">
                                                <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.3)" strokeWidth="12" fill="none" />
                                                <circle 
                                                    cx="80" cy="80" r="70" 
                                                    stroke="white" strokeWidth="12" fill="none"
                                                    strokeDasharray={`${percentage * 4.4} 440`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-5xl font-bold">{percentage}%</span>
                                            </div>
                                        </div>
                                        <p className="text-xl">{score} out of {mcqs.length} correct</p>
                                        <p className="text-sm opacity-80 mt-2">Time: {formatTime(quizDuration)}</p>
                                    </div>
                                    
                                    <div className="p-6 flex gap-4 justify-center">
                                        <button onClick={resetQuiz} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300">
                                            Try Again
                                        </button>
                                        <button 
                                            onClick={() => setReviewMode(true)} 
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                                        >
                                            Review Answers
                                        </button>
                                    </div>
                                </div>

                                {/* Review Mode */}
                                {reviewMode && (
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-2xl shadow-lg p-4 flex gap-2 justify-center">
                                            {[
                                                { key: 'all', label: 'All Questions' },
                                                { key: 'correct', label: `✓ Correct (${mcqs.filter((_, i) => userAnswers[i] === mcqs[i].answer).length})` },
                                                { key: 'incorrect', label: `✗ Incorrect (${mcqs.filter((_, i) => userAnswers[i] !== mcqs[i].answer).length})` }
                                            ].map(filter => (
                                                <button
                                                    key={filter.key}
                                                    onClick={() => setReviewFilter(filter.key)}
                                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                                        reviewFilter === filter.key
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>

                                        {getFilteredReviewQuestions().map((mcq) => {
                                            const isCorrect = userAnswers[mcq.index] === mcq.answer;
                                            const userAnswer = userAnswers[mcq.index];
                                            
                                            return (
                                                <div key={mcq.index} className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
                                                    isCorrect ? 'border-green-500' : 'border-red-500'
                                                }`}>
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                                            isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                            {isCorrect ? '✓' : '✗'}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-500 mb-1">Question {mcq.index + 1}</p>
                                                            <p className="text-lg font-medium text-gray-900">{mcq.question}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2 ml-14">
                                                        {mcq.options.map((opt, idx) => {
                                                            const optKey = opt[0];
                                                            const isCorrectAnswer = optKey === mcq.answer;
                                                            const isUserAnswer = optKey === userAnswer;
                                                            
                                                            let bgClass = 'bg-gray-50';
                                                            let borderClass = 'border-transparent';
                                                            let label = '';
                                                            
                                                            if (isCorrectAnswer) {
                                                                bgClass = 'bg-green-50';
                                                                borderClass = 'border-green-500';
                                                                label = '✓ Correct Answer';
                                                            } else if (isUserAnswer && !isCorrect) {
                                                                bgClass = 'bg-red-50';
                                                                borderClass = 'border-red-500';
                                                                label = '✗ Your Answer';
                                                            }
                                                            
                                                            return (
                                                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border-2 ${bgClass} ${borderClass}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                                            isCorrectAnswer ? 'bg-green-500 text-white' :
                                                                            isUserAnswer ? 'bg-red-500 text-white' :
                                                                            'bg-gray-200 text-gray-600'
                                                                        }`}>
                                                                            {optKey}
                                                                        </span>
                                                                        <span className="text-gray-700">{opt.substring(2).trim()}</span>
                                                                    </div>
                                                                    {label && (
                                                                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                                            isCorrectAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                        }`}>
                                                                            {label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Quiz Mode - One Question at a Time */
                            <div className="space-y-6">
                                {/* Progress Bar */}
                                <div className="bg-white rounded-2xl shadow-lg p-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Question {currentQuestion + 1} of {mcqs.length}</span>
                                        <span>{Object.keys(userAnswers).length} answered</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                                            style={{ width: `${((currentQuestion + 1) / mcqs.length) * 100}%` }}
                                        />
                                    </div>
                                    
                                    {/* Question Navigator */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {mcqs.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => goToQuestion(i)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                    i === currentQuestion
                                                        ? 'bg-indigo-600 text-white'
                                                        : userAnswers[i]
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Question */}
                                <div className="bg-white rounded-3xl shadow-lg p-8">
                                    <p className="text-xl font-medium text-gray-900 mb-6">
                                        {mcqs[currentQuestion].question}
                                    </p>
                                    
                                    <div className="space-y-3">
                                        {mcqs[currentQuestion].options.map((opt, idx) => {
                                            const optKey = opt[0];
                                            const isSelected = userAnswers[currentQuestion] === optKey;
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(optKey)}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-100 border-2 border-indigo-500'
                                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                    }`}
                                                >
                                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                                                        isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {optKey}
                                                    </span>
                                                    <span className="text-gray-700">{opt.substring(2).trim()}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestion === 0}
                                        className="px-6 py-3 bg-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        ← Previous
                                    </button>
                                    
                                    {currentQuestion === mcqs.length - 1 ? (
                                        <button
                                            onClick={handleQuizSubmit}
                                            disabled={Object.keys(userAnswers).length < mcqs.length}
                                            className={`px-8 py-3 rounded-xl font-bold ${
                                                Object.keys(userAnswers).length < mcqs.length
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                            }`}
                                        >
                                            Submit Quiz
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestion(prev => Math.min(mcqs.length - 1, prev + 1))}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700"
                                        >
                                            Next →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Short Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="space-y-6">
                        {!shortNotes || shortNotes.totalPoints === 0 ? (
                            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Short Notes Generated</h3>
                                <p className="text-gray-600 mb-6">Click the Regenerate button to generate short notes from this PDF.</p>
                                <button
                                    onClick={() => { setRegenerateType('notes'); setShowRegenerateModal(true); }}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                                >
                                    Generate Short Notes
                                </button>
                            </div>
                        ) : (
                            <>
                                {shortNotes.summary && (
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white">
                                        <h3 className="text-lg font-semibold mb-2">📄 Summary</h3>
                                        <p className="text-white/90">{shortNotes.summary}</p>
                                    </div>
                                )}

                                {shortNotes.sections?.map((section, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>
                                        <ul className="space-y-3">
                                            {section.items?.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-gray-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Flash Cards Tab */}
                {activeTab === 'cards' && (
                    <div className="space-y-6">
                        {shuffledCards.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">🎴</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Flashcards Generated</h3>
                                <p className="text-gray-600 mb-6">Click the Regenerate button to generate flashcards from this note.</p>
                                <button
                                    onClick={() => { setRegenerateType('flashcards'); setShowRegenerateModal(true); }}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                                >
                                    Generate Flashcards
                                </button>
                            </div>
                        ) : showCompletion ? (
                            /* Completion Screen */
                            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">All Cards Reviewed!</h2>
                                <div className="flex justify-center gap-8 mb-8">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-green-600">{knownCards.size}</p>
                                        <p className="text-gray-600">Known</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-orange-600">{learningCards.size}</p>
                                        <p className="text-gray-600">Learning</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={resetCards} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300">
                                        Start Over
                                    </button>
                                    <button onClick={shuffleCards} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
                                        Shuffle & Retry
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Progress Bar */}
                                <div className="bg-white rounded-2xl shadow-lg p-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Card {currentCardIndex + 1} of {shuffledCards.length}</span>
                                        <div className="flex gap-4">
                                            <span className="text-green-600">✓ Known: {knownCards.size}</span>
                                            <span className="text-orange-600">📚 Learning: {learningCards.size}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                                            style={{ width: `${cardProgress}%` }}
                                        />
                                    </div>
                                    
                                    {/* Card indicators */}
                                    <div className="flex gap-1 mt-3 justify-center flex-wrap">
                                        {shuffledCards.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setCurrentCardIndex(i); setIsFlipped(false); }}
                                                className={`w-3 h-3 rounded-full transition-all ${
                                                    i === currentCardIndex
                                                        ? 'bg-indigo-600 w-6'
                                                        : knownCards.has(i)
                                                            ? 'bg-green-400'
                                                            : learningCards.has(i)
                                                                ? 'bg-orange-400'
                                                                : 'bg-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Flashcard — fixed 3D flip */}
                                <div
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className="cursor-pointer"
                                    style={{ perspective: '1200px' }}
                                >
                                    <div
                                        style={{
                                            position: 'relative',
                                            minHeight: '350px',
                                            transformStyle: 'preserve-3d',
                                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        }}
                                    >
                                        {/* Front face */}
                                        <div
                                            className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center absolute inset-0"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                WebkitBackfaceVisibility: 'hidden',
                                            }}
                                        >
                                            <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mb-6">
                                                Question
                                            </span>
                                            <p className="text-2xl font-medium text-gray-900 text-center leading-relaxed">
                                                {currentCard?.front}
                                            </p>
                                            <p className="text-gray-400 mt-8 text-sm flex items-center gap-2">
                                                <span className="px-2 py-1 bg-gray-100 rounded">Space</span>
                                                to flip
                                            </p>
                                        </div>

                                        {/* Back face — pre-rotated 180deg so it shows correctly when flipped */}
                                        <div
                                            className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center absolute inset-0"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                WebkitBackfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                            }}
                                        >
                                            <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-6">
                                                Answer
                                            </span>
                                            <p className="text-2xl font-medium text-white text-center leading-relaxed">
                                                {currentCard?.back}
                                            </p>
                                        </div>

                                        {/* Invisible spacer to maintain container height */}
                                        <div style={{ minHeight: '350px', visibility: 'hidden' }} aria-hidden="true" />
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={prevCard}
                                        disabled={currentCardIndex === 0}
                                        className="px-6 py-3 bg-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span>←</span> Previous
                                    </button>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={markAsKnown}
                                            className="px-4 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 flex items-center gap-2"
                                        >
                                            <span>↑</span> Known
                                        </button>
                                        <button
                                            onClick={markAsLearning}
                                            className="px-4 py-3 bg-orange-100 text-orange-700 rounded-xl font-medium hover:bg-orange-200 flex items-center gap-2"
                                        >
                                            <span>↓</span> Learning
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={nextCard}
                                        disabled={currentCardIndex === shuffledCards.length - 1}
                                        className="px-6 py-3 bg-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        Next <span>→</span>
                                    </button>
                                </div>

                                {/* Shuffle/Reset */}
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={shuffleCards}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2"
                                    >
                                        🔀 Shuffle
                                    </button>
                                    <button
                                        onClick={resetCards}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2"
                                    >
                                        🔄 Reset
                                    </button>
                                </div>

                                {/* Keyboard hints */}
                                <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                                    <span className="mr-4"><strong>←→</strong> Navigate</span>
                                    <span className="mr-4"><strong>Space/Enter</strong> Flip</span>
                                    <span className="mr-4"><strong>↑</strong> Mark Known</span>
                                    <span><strong>↓</strong> Mark Learning</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Regenerate Modal */}
                {showRegenerateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">🔄 Regenerate Content</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">What to regenerate:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { key: 'all', label: '🔄 Everything' },
                                            { key: 'mcqs', label: '📝 MCQs Only' },
                                            { key: 'flashcards', label: '🎴 Flashcards Only' },
                                            { key: 'notes', label: '📋 Notes Only' }
                                        ].map(opt => (
                                            <button
                                                key={opt.key}
                                                onClick={() => setRegenerateType(opt.key)}
                                                className={`p-3 rounded-xl font-medium transition-all ${
                                                    regenerateType === opt.key
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(regenerateType === 'all' || regenerateType === 'mcqs') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of MCQs: {regenerateMcqCount}
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="30"
                                            value={regenerateMcqCount}
                                            onChange={(e) => setRegenerateMcqCount(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                )}

                                {(regenerateType === 'all' || regenerateType === 'flashcards') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Flashcards: {regenerateFlashcardCount}
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="25"
                                            value={regenerateFlashcardCount}
                                            onChange={(e) => setRegenerateFlashcardCount(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                )}

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
                                    ⚠️ This will replace existing {regenerateType === 'all' ? 'content' : regenerateType}.
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowRegenerateModal(false)}
                                    disabled={regenerating}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {regenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Regenerating...
                                        </>
                                    ) : (
                                        'Regenerate'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}