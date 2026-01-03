// src/pages/user/NoteDetail.jsx
import React, { useState, useEffect } from 'react';
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
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    
    // Flash card state
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (!location.state) {
            fetchNote();
        }
    }, [id]);

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

    const handleAnswerChange = (index, answer) => {
        setUserAnswers(prev => ({ ...prev, [index]: answer }));
    };

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        let correct = 0;
        mcqs.forEach((mcq, i) => {
            if (userAnswers[i] === mcq.answer) correct++;
        });
        setScore(correct);
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
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
    };

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

    const percentage = mcqs.length > 0 ? Math.round((score / mcqs.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                    <Link to="/user/notes/list" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4">
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

                {/* MCQ Tab */}
                {activeTab === 'mcq' && (
                    <div className="space-y-6">
                        {showResults ? (
                            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                                <div className={`p-8 text-center text-white ${
                                    percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                    percentage >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                                    'bg-gradient-to-r from-red-500 to-rose-600'
                                }`}>
                                    <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                                    <div className="text-6xl font-bold my-4">{percentage}%</div>
                                    <p className="text-xl">{score} out of {mcqs.length} correct</p>
                                </div>
                                <div className="p-6 flex gap-4 justify-center">
                                    <button
                                        onClick={resetQuiz}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleQuizSubmit}>
                                {mcqs.map((mcq, i) => {
                                    const options = mcq.options.map(opt => opt.replace(/\n/g, ' ').trim());
                                    return (
                                        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 mb-4">
                                            <p className="text-lg font-medium text-gray-900 mb-4">
                                                <span className="inline-flex w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 items-center justify-center mr-3 font-bold text-sm">
                                                    {i + 1}
                                                </span>
                                                {mcq.question}
                                            </p>
                                            <div className="space-y-2 ml-11">
                                                {options.map((opt, idx) => {
                                                    const key = opt[0];
                                                    const isSelected = userAnswers[i] === key;
                                                    return (
                                                        <label
                                                            key={idx}
                                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                                                isSelected
                                                                    ? 'bg-indigo-100 border-2 border-indigo-500'
                                                                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q-${i}`}
                                                                checked={isSelected}
                                                                onChange={() => handleAnswerChange(i, key)}
                                                                className="hidden"
                                                            />
                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                                                isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                                                            }`}>
                                                                {key}
                                                            </span>
                                                            <span>{opt.substring(2).trim()}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                <button
                                    type="submit"
                                    disabled={Object.keys(userAnswers).length < mcqs.length}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg ${
                                        Object.keys(userAnswers).length < mcqs.length
                                            ? 'bg-gray-200 text-gray-500'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    }`}
                                >
                                    {Object.keys(userAnswers).length < mcqs.length 
                                        ? `Answer all questions (${Object.keys(userAnswers).length}/${mcqs.length})`
                                        : 'Submit Quiz'
                                    }
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Short Notes Tab */}
                {activeTab === 'notes' && shortNotes && (
                    <div className="space-y-6">
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

                {/* Flash Cards Tab */}
                {activeTab === 'cards' && flashCards.length > 0 && (
                    <div>
                        <div 
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="bg-white rounded-3xl shadow-xl p-8 min-h-[300px] flex items-center justify-center cursor-pointer hover:shadow-2xl transition-all"
                        >
                            <div className="text-center">
                                {!isFlipped ? (
                                    <>
                                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mb-4">
                                            Question
                                        </span>
                                        <p className="text-2xl font-medium text-gray-900">
                                            {flashCards[currentCardIndex]?.front}
                                        </p>
                                        <p className="text-gray-500 mt-4 text-sm">Click to reveal answer</p>
                                    </>
                                ) : (
                                    <>
                                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-4">
                                            Answer
                                        </span>
                                        <p className="text-2xl font-medium text-gray-900">
                                            {flashCards[currentCardIndex]?.back}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <button
                                onClick={() => { setCurrentCardIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
                                disabled={currentCardIndex === 0}
                                className="px-6 py-3 bg-white rounded-xl shadow-lg disabled:opacity-50"
                            >
                                ← Previous
                            </button>
                            <span className="text-gray-600 font-medium">
                                {currentCardIndex + 1} / {flashCards.length}
                            </span>
                            <button
                                onClick={() => { setCurrentCardIndex(prev => Math.min(flashCards.length - 1, prev + 1)); setIsFlipped(false); }}
                                disabled={currentCardIndex === flashCards.length - 1}
                                className="px-6 py-3 bg-white rounded-xl shadow-lg disabled:opacity-50"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}