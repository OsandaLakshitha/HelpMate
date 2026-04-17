// src/pages/user/NoteDetails.jsx
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
    
    // MCQ Quiz state - Enhanced
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizMode, setQuizMode] = useState('start'); // 'start', 'quiz', 'results', 'review'
    const [score, setScore] = useState(0);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [quizEndTime, setQuizEndTime] = useState(null);
    const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'correct', 'incorrect'
    
    // Flash card state - Enhanced
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledCards, setShuffledCards] = useState([]);
    const [isShuffled, setIsShuffled] = useState(false);
    const [knownCards, setKnownCards] = useState(new Set());
    const [learningCards, setLearningCards] = useState(new Set());
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    useEffect(() => {
        if (!location.state) {
            fetchNote();
        }
    }, [id]);

    // Initialize shuffled cards when flashCards load
    useEffect(() => {
        if (flashCards.length > 0) {
            setShuffledCards([...flashCards]);
        }
    }, [flashCards]);

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

    // ==================== MCQ FUNCTIONS ====================
    
    const startQuiz = () => {
        setQuizMode('quiz');
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
        setQuizStartTime(Date.now());
        setQuizEndTime(null);
    };

    const handleAnswerSelect = (questionIndex, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < mcqs.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const handleQuizSubmit = async () => {
        let correct = 0;
        mcqs.forEach((mcq, i) => {
            if (userAnswers[i] === mcq.answer) correct++;
        });
        setScore(correct);
        setQuizEndTime(Date.now());
        setQuizMode('results');
        
        try {
            await api.post(`/api/notes/${id}/quiz-attempt`, {
                score: correct,
                totalQuestions: mcqs.length
            });
        } catch (err) {
            console.error(err);
        }
    };

    const startReview = (filter = 'all') => {
        setReviewFilter(filter);
        setQuizMode('review');
        setCurrentQuestionIndex(0);
    };

    const resetQuiz = () => {
        setUserAnswers({});
        setScore(0);
        setQuizMode('start');
        setCurrentQuestionIndex(0);
        setQuizStartTime(null);
        setQuizEndTime(null);
        setReviewFilter('all');
    };

    const getTimeTaken = () => {
        if (!quizStartTime || !quizEndTime) return '0:00';
        const seconds = Math.floor((quizEndTime - quizStartTime) / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isAnswerCorrect = (index) => {
        return userAnswers[index] === mcqs[index]?.answer;
    };

    const getFilteredQuestions = () => {
        if (reviewFilter === 'all') return mcqs.map((mcq, i) => ({ mcq, index: i }));
        if (reviewFilter === 'correct') return mcqs.map((mcq, i) => ({ mcq, index: i })).filter(({ index }) => isAnswerCorrect(index));
        if (reviewFilter === 'incorrect') return mcqs.map((mcq, i) => ({ mcq, index: i })).filter(({ index }) => !isAnswerCorrect(index));
        return mcqs.map((mcq, i) => ({ mcq, index: i }));
    };

    const answeredCount = Object.keys(userAnswers).length;
    const percentage = mcqs.length > 0 ? Math.round((score / mcqs.length) * 100) : 0;
    const correctCount = mcqs.filter((_, i) => isAnswerCorrect(i)).length;
    const incorrectCount = mcqs.length - correctCount;

    // ==================== FLASH CARD FUNCTIONS ====================
    
    const currentCards = isShuffled ? shuffledCards : flashCards;
    
    const shuffleCards = useCallback(() => {
        const cards = [...flashCards];
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        setShuffledCards(cards);
        setIsShuffled(true);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    }, [flashCards]);

    const resetCards = useCallback(() => {
        setShuffledCards([...flashCards]);
        setIsShuffled(false);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
        setLearningCards(new Set());
    }, [flashCards]);

    const goToNextCard = useCallback(() => {
        if (currentCardIndex < currentCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        } else if (currentCardIndex === currentCards.length - 1) {
            setShowCompletionModal(true);
        }
    }, [currentCardIndex, currentCards.length]);

    const goToPrevCard = useCallback(() => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    }, [currentCardIndex]);

    const markAsKnown = useCallback(() => {
        const cardId = currentCardIndex;
        setKnownCards(prev => new Set([...prev, cardId]));
        setLearningCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(cardId);
            return newSet;
        });
        goToNextCard();
    }, [currentCardIndex, goToNextCard]);

    const markAsLearning = useCallback(() => {
        const cardId = currentCardIndex;
        setLearningCards(prev => new Set([...prev, cardId]));
        setKnownCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(cardId);
            return newSet;
        });
        goToNextCard();
    }, [currentCardIndex, goToNextCard]);

    // Keyboard navigation for flashcards
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (activeTab !== 'cards') return;
            
            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    setIsFlipped(prev => !prev);
                    break;
                case 'ArrowRight':
                    goToNextCard();
                    break;
                case 'ArrowLeft':
                    goToPrevCard();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    markAsKnown();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    markAsLearning();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab, goToNextCard, goToPrevCard, markAsKnown, markAsLearning]);

    // Progress calculations for flashcards
    const progressPercent = currentCards.length > 0 
        ? Math.round(((currentCardIndex + 1) / currentCards.length) * 100) 
        : 0;
    
    const knownPercent = currentCards.length > 0 
        ? Math.round((knownCards.size / currentCards.length) * 100) 
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Note not found</h2>
                    <Link to="/user/notes/list" className="text-indigo-600 hover:underline">← Back to My Notes</Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'mcq', label: 'MCQ Quiz', icon: '📝', count: mcqs.length },
        { id: 'notes', label: 'Short Notes', icon: '📋', count: shortNotes?.totalPoints || 0 },
        { id: 'cards', label: 'Flash Cards', icon: '🎴', count: flashCards.length }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            {/* CSS for animations */}
            <style>{`
                .flip-card {
                    perspective: 1000px;
                }
                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                }
                .flip-card-inner.flipped {
                    transform: rotateY(180deg);
                }
                .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    border-radius: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem;
                }
                .flip-card-back {
                    transform: rotateY(180deg);
                }
                @keyframes pulse-border {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
                }
                .card-hint {
                    animation: pulse-border 2s infinite;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
                }
                .confetti {
                    animation: confetti 1s ease-out forwards;
                }
            `}</style>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                    <Link to="/user/notes/list" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to My Notes
                    </Link>
                    
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

                {/* ==================== MCQ TAB - ENHANCED ==================== */}
                {activeTab === 'mcq' && (
                    <div className="space-y-6">
                        {/* Start Screen */}
                        {quizMode === 'start' && (
                            <div className="bg-white rounded-3xl shadow-lg p-8 text-center animate-slideIn">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-5xl">📝</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Test Your Knowledge?</h2>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    This quiz has <span className="font-semibold text-indigo-600">{mcqs.length} questions</span> based on your uploaded notes. 
                                    Take your time and do your best!
                                </p>
                                
                                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                                    <div className="bg-indigo-50 rounded-2xl p-4">
                                        <p className="text-2xl font-bold text-indigo-600">{mcqs.length}</p>
                                        <p className="text-xs text-indigo-700">Questions</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-2xl p-4">
                                        <p className="text-2xl font-bold text-purple-600">4</p>
                                        <p className="text-xs text-purple-700">Options Each</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-2xl p-4">
                                        <p className="text-2xl font-bold text-blue-600">∞</p>
                                        <p className="text-xs text-blue-700">No Time Limit</p>
                                    </div>
                                </div>

                                <button
                                    onClick={startQuiz}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    Start Quiz →
                                </button>
                            </div>
                        )}

                        {/* Quiz Mode - One question at a time */}
                        {quizMode === 'quiz' && mcqs.length > 0 && (
                            <div className="animate-slideIn">
                                {/* Progress Bar */}
                                <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Question {currentQuestionIndex + 1} of {mcqs.length}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {answeredCount} answered
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                            style={{ width: `${((currentQuestionIndex + 1) / mcqs.length) * 100}%` }}
                                        />
                                    </div>
                                    {/* Question Indicators */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {mcqs.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => goToQuestion(idx)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                    idx === currentQuestionIndex
                                                        ? 'bg-indigo-600 text-white shadow-md scale-110'
                                                        : userAnswers[idx]
                                                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Question */}
                                <div className="bg-white rounded-3xl shadow-lg p-8">
                                    <div className="mb-6">
                                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg mb-4">
                                            {currentQuestionIndex + 1}
                                        </span>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {mcqs[currentQuestionIndex]?.question}
                                        </h3>
                                    </div>

                                    <div className="space-y-3">
                                        {mcqs[currentQuestionIndex]?.options.map((opt, idx) => {
                                            const cleanOpt = opt.replace(/\n/g, ' ').trim();
                                            const key = cleanOpt[0];
                                            const isSelected = userAnswers[currentQuestionIndex] === key;
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(currentQuestionIndex, key)}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md'
                                                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                                                    }`}
                                                >
                                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                                                        isSelected 
                                                            ? 'bg-indigo-600 text-white' 
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {key}
                                                    </span>
                                                    <span className="flex-1 text-gray-800 font-medium">
                                                        {cleanOpt.substring(2).trim()}
                                                    </span>
                                                    {isSelected && (
                                                        <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                                        <button
                                            onClick={prevQuestion}
                                            disabled={currentQuestionIndex === 0}
                                            className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>

                                        {currentQuestionIndex < mcqs.length - 1 ? (
                                            <button
                                                onClick={nextQuestion}
                                                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                                            >
                                                Next
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleQuizSubmit}
                                                disabled={answeredCount < mcqs.length}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                                                    answeredCount < mcqs.length
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                                                }`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Submit Quiz ({answeredCount}/{mcqs.length})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Screen */}
                        {quizMode === 'results' && (
                            <div className="animate-slideIn">
                                {/* Score Card */}
                                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                                    <div className={`p-8 text-center text-white relative overflow-hidden ${
                                        percentage >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                        percentage >= 60 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                        percentage >= 40 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                        'bg-gradient-to-br from-red-500 to-rose-600'
                                    }`}>
                                        {/* Decorative circles */}
                                        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
                                        
                                        <div className="relative z-10">
                                            <h2 className="text-2xl font-bold mb-4">
                                                {percentage >= 80 ? '🎉 Excellent!' :
                                                 percentage >= 60 ? '👍 Good Job!' :
                                                 percentage >= 40 ? '💪 Keep Practicing!' :
                                                 '📚 Need More Study'}
                                            </h2>
                                            
                                            {/* Circular Progress */}
                                            <div className="relative w-40 h-40 mx-auto mb-4">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle
                                                        cx="80" cy="80" r="70"
                                                        stroke="rgba(255,255,255,0.3)"
                                                        strokeWidth="12"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        cx="80" cy="80" r="70"
                                                        stroke="white"
                                                        strokeWidth="12"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${percentage * 4.4} 440`}
                                                        className="transition-all duration-1000"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-5xl font-bold">{percentage}%</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-xl font-medium mb-2">
                                                {score} out of {mcqs.length} correct
                                            </p>
                                            <p className="text-white/80 text-sm">
                                                Time taken: {getTimeTaken()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                                        <div className="p-6 text-center">
                                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">{score}</p>
                                            <p className="text-sm text-gray-500">Correct</p>
                                        </div>
                                        <div className="p-6 text-center">
                                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                            <p className="text-2xl font-bold text-red-600">{mcqs.length - score}</p>
                                            <p className="text-sm text-gray-500">Incorrect</p>
                                        </div>
                                        <div className="p-6 text-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">{getTimeTaken()}</p>
                                            <p className="text-sm text-gray-500">Time</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Answers</h3>
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <button
                                            onClick={() => startReview('all')}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-all"
                                        >
                                            <span className="text-lg">📋</span>
                                            All ({mcqs.length})
                                        </button>
                                        <button
                                            onClick={() => startReview('correct')}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-all"
                                        >
                                            <span className="text-lg">✓</span>
                                            Correct ({score})
                                        </button>
                                        <button
                                            onClick={() => startReview('incorrect')}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-all"
                                        >
                                            <span className="text-lg">✗</span>
                                            Incorrect ({mcqs.length - score})
                                        </button>
                                    </div>
                                    <button
                                        onClick={resetQuiz}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Review Mode - See all answers */}
                        {quizMode === 'review' && (
                            <div className="animate-slideIn">
                                {/* Review Header */}
                                <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQuizMode('results')}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back to Results
                                        </button>
                                        <span className="text-gray-600 font-medium">
                                            Reviewing: {reviewFilter === 'all' ? 'All Questions' : reviewFilter === 'correct' ? 'Correct Answers' : 'Incorrect Answers'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setReviewFilter('all')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${reviewFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setReviewFilter('correct')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${reviewFilter === 'correct' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            ✓ Correct
                                        </button>
                                        <button
                                            onClick={() => setReviewFilter('incorrect')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${reviewFilter === 'incorrect' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            ✗ Incorrect
                                        </button>
                                    </div>
                                </div>

                                {/* Questions Review */}
                                <div className="space-y-4">
                                    {getFilteredQuestions().map(({ mcq, index }) => {
                                        const isCorrect = isAnswerCorrect(index);
                                        const userAnswer = userAnswers[index];
                                        const correctAnswer = mcq.answer;
                                        
                                        return (
                                            <div key={index} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                                                <div className="p-6">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                            {isCorrect ? '✓' : '✗'}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-gray-500 mb-1">Question {index + 1}</p>
                                                            <h3 className="text-lg font-semibold text-gray-900">{mcq.question}</h3>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 ml-14">
                                                        {mcq.options.map((opt, idx) => {
                                                            const cleanOpt = opt.replace(/\n/g, ' ').trim();
                                                            const key = cleanOpt[0];
                                                            const isUserAnswer = key === userAnswer;
                                                            const isCorrectAnswer = key === correctAnswer;
                                                            
                                                            let bgClass = 'bg-gray-50';
                                                            let borderClass = 'border-transparent';
                                                            let textClass = 'text-gray-700';
                                                            
                                                            if (isCorrectAnswer) {
                                                                bgClass = 'bg-green-50';
                                                                borderClass = 'border-green-500';
                                                                textClass = 'text-green-800';
                                                            } else if (isUserAnswer && !isCorrect) {
                                                                bgClass = 'bg-red-50';
                                                                borderClass = 'border-red-500';
                                                                textClass = 'text-red-800';
                                                            }
                                                            
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 ${bgClass} ${borderClass}`}
                                                                >
                                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                                                        isCorrectAnswer ? 'bg-green-500 text-white' :
                                                                        isUserAnswer && !isCorrect ? 'bg-red-500 text-white' :
                                                                        'bg-gray-200 text-gray-600'
                                                                    }`}>
                                                                        {key}
                                                                    </span>
                                                                    <span className={`flex-1 ${textClass}`}>
                                                                        {cleanOpt.substring(2).trim()}
                                                                    </span>
                                                                    {isCorrectAnswer && (
                                                                        <span className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-medium">
                                                                            Correct Answer
                                                                        </span>
                                                                    )}
                                                                    {isUserAnswer && !isCorrect && (
                                                                        <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium">
                                                                            Your Answer
                                                                        </span>
                                                                    )}
                                                                    {isUserAnswer && isCorrect && (
                                                                        <span className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-medium">
                                                                            ✓ Your Answer
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Action */}
                                <div className="mt-6 flex gap-4">
                                    <button
                                        onClick={() => setQuizMode('results')}
                                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Back to Results
                                    </button>
                                    <button
                                        onClick={resetQuiz}
                                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== SHORT NOTES TAB ==================== */}
                {activeTab === 'notes' && shortNotes && (
                    <div className="space-y-6 animate-slideIn">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">📄 Summary</h3>
                            <p className="text-white/90">{shortNotes.summary}</p>
                        </div>

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
                    </div>
                )}

                {/* ==================== FLASH CARDS TAB - ENHANCED ==================== */}
                {activeTab === 'cards' && currentCards.length > 0 && (
                    <div className="space-y-6 animate-slideIn">
                        {/* Controls Bar */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {/* Progress Info */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-indigo-600">{currentCardIndex + 1}/{currentCards.length}</p>
                                        <p className="text-xs text-gray-500">Progress</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{knownCards.size}</p>
                                        <p className="text-xs text-gray-500">Known</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">{learningCards.size}</p>
                                        <p className="text-xs text-gray-500">Learning</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={shuffleCards}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                            isShuffled 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Shuffle
                                    </button>
                                    <button
                                        onClick={resetCards}
                                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{progressPercent}% completed</span>
                                    <span>{knownPercent}% known</span>
                                </div>
                            </div>
                        </div>

                        {/* Flash Card with Flip Animation */}
                        <div className="flip-card h-[350px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                                {/* Front */}
                                <div className={`flip-card-front bg-white shadow-xl ${!isFlipped ? 'card-hint' : ''}`}>
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                                        Question
                                    </span>
                                    {knownCards.has(currentCardIndex) && (
                                        <span className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                                            ✓ Known
                                        </span>
                                    )}
                                    {learningCards.has(currentCardIndex) && (
                                        <span className="absolute top-4 right-4 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                                            📚 Learning
                                        </span>
                                    )}
                                    <p className="text-2xl font-medium text-gray-900 text-center px-4">
                                        {currentCards[currentCardIndex]?.front}
                                    </p>
                                    <p className="absolute bottom-4 text-gray-400 text-sm flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">Space</span> to flip
                                    </p>
                                </div>

                                {/* Back */}
                                <div className="flip-card-back bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl">
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                                        Answer
                                    </span>
                                    <p className="text-2xl font-medium text-white text-center px-4">
                                        {currentCards[currentCardIndex]?.back}
                                    </p>
                                    <p className="absolute bottom-4 text-white/60 text-sm">
                                        Click or press Space to flip back
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation & Rating Buttons */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            {/* Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={goToPrevCard}
                                    disabled={currentCardIndex === 0}
                                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <div className="flex items-center gap-2 flex-wrap justify-center max-w-md">
                                    {currentCards.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setCurrentCardIndex(idx); setIsFlipped(false); }}
                                            className={`w-3 h-3 rounded-full transition-all ${
                                                idx === currentCardIndex 
                                                    ? 'bg-indigo-600 scale-125' 
                                                    : knownCards.has(idx)
                                                        ? 'bg-green-400'
                                                        : learningCards.has(idx)
                                                            ? 'bg-orange-400'
                                                            : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={goToNextCard}
                                    disabled={currentCardIndex === currentCards.length - 1}
                                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                                >
                                    Next
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Rating Buttons */}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={markAsLearning}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-medium hover:bg-orange-100 transition-all border-2 border-orange-200"
                                >
                                    <span className="text-xl">📚</span>
                                    Still Learning
                                    <span className="text-xs bg-orange-200 px-2 py-0.5 rounded">↓</span>
                                </button>
                                <button
                                    onClick={markAsKnown}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-all border-2 border-green-200"
                                >
                                    <span className="text-xl">✓</span>
                                    Got It!
                                    <span className="text-xs bg-green-200 px-2 py-0.5 rounded">↑</span>
                                </button>
                            </div>

                            {/* Keyboard Hints */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 text-center">
                                    Keyboard shortcuts: 
                                    <span className="mx-1 px-2 py-0.5 bg-gray-100 rounded">←</span>Previous
                                    <span className="mx-1 px-2 py-0.5 bg-gray-100 rounded">→</span>Next
                                    <span className="mx-1 px-2 py-0.5 bg-gray-100 rounded">Space</span>Flip
                                    <span className="mx-1 px-2 py-0.5 bg-gray-100 rounded">↑</span>Known
                                    <span className="mx-1 px-2 py-0.5 bg-gray-100 rounded">↓</span>Learning
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completion Modal for Flash Cards */}
                {showCompletionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-slideIn">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Great Job! 🎉</h3>
                            <p className="text-gray-600 mb-6">You've reviewed all {currentCards.length} flash cards!</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-green-50 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-green-600">{knownCards.size}</p>
                                    <p className="text-sm text-green-700">Cards Known</p>
                                </div>
                                <div className="bg-orange-50 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-orange-600">{learningCards.size}</p>
                                    <p className="text-sm text-orange-700">Still Learning</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCompletionModal(false);
                                        resetCards();
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    Start Over
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCompletionModal(false);
                                        shuffleCards();
                                    }}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90"
                                >
                                    Shuffle & Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}