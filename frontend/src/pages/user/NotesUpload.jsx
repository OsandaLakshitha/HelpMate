// src/pages/user/NotesUpload.jsx
import React, { useState, useRef } from 'react';

export default function NotesUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    
    // Quiz interaction state
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    
    const fileInputRef = useRef(null);

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setError('');
            } else {
                setError('Please upload a PDF file');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a PDF file');
            return;
        }

        const formData = new FormData();
        formData.append('lectureNote', file);

        setUploading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8080/api/notes/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setUserAnswers({});
                setShowResults(false);
                setScore(0);
                setCurrentQuestion(0);
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Network error. Is the backend running?');
        } finally {
            setUploading(false);
        }
    };

    const handleAnswerChange = (questionIndex, selectedOption) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionIndex]: selectedOption
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let correctCount = 0;
        result.mcqs.forEach((mcq, index) => {
            if (userAnswers[index] === mcq.answer) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setShowResults(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetQuiz = () => {
        setShowResults(false);
        setUserAnswers({});
        setScore(0);
        setCurrentQuestion(0);
    };

    const startNewQuiz = () => {
        setResult(null);
        setFile(null);
        resetQuiz();
    };

    const getPerformanceData = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 90) return { 
            message: "Outstanding! You've mastered this topic! 🏆", 
            color: "from-emerald-500 to-green-600",
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-700",
            icon: "🎯"
        };
        if (percentage >= 70) return { 
            message: "Great job! You have a solid understanding! 💪", 
            color: "from-blue-500 to-indigo-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            icon: "📚"
        };
        if (percentage >= 50) return { 
            message: "Good effort! Review the topics you missed. 📖", 
            color: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-50",
            textColor: "text-amber-700",
            icon: "💡"
        };
        return { 
            message: "Keep practicing! Review the material and try again. 🔄", 
            color: "from-red-500 to-rose-600",
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            icon: "📝"
        };
    };

    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = result?.mcqs?.length || 0;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    // ============== UPLOAD SCREEN ==============
    if (!result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Quiz Generator</h1>
                        <p className="text-gray-600">Upload your lecture notes and test your knowledge</p>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                                dragActive 
                                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
                                    : file 
                                        ? 'border-green-400 bg-green-50' 
                                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                    setFile(e.target.files[0]);
                                    setError('');
                                }}
                                className="hidden"
                            />
                            
                            {file ? (
                                <div className="space-y-3">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100">
                                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">
                                            Drop your PDF here, or <span className="text-indigo-600">browse</span>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">Supports PDF files up to 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !file}
                            className={`w-full mt-6 py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
                                uploading || !file
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Generating Questions...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate Quiz
                                </span>
                            )}
                        </button>

                        {/* Loading Message */}
                        {uploading && (
                            <div className="mt-6 p-4 bg-indigo-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-xl">🤖</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-indigo-900">AI is analyzing your document</p>
                                        <p className="text-xs text-indigo-600">This may take 30-60 seconds...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            {[
                                { icon: "⚡", title: "Fast", desc: "Quick generation" },
                                { icon: "🎯", title: "Accurate", desc: "AI-powered" },
                                { icon: "📊", title: "Detailed", desc: "Score tracking" }
                            ].map((feature, idx) => (
                                <div key={idx} className="text-center p-3">
                                    <span className="text-2xl">{feature.icon}</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{feature.title}</p>
                                    <p className="text-xs text-gray-500">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============== RESULTS SCREEN ==============
    if (showResults) {
        const performance = getPerformanceData(score, totalQuestions);
        const percentage = Math.round((score / totalQuestions) * 100);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Score Card */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
                        <div className={`bg-gradient-to-r ${performance.color} p-8 text-white text-center`}>
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                                <span className="text-5xl">{performance.icon}</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                            <p className="text-white/90">{result.note.fileName}</p>
                        </div>

                        <div className="p-8">
                            {/* Circular Score */}
                            <div className="flex justify-center mb-8">
                                <div className="relative w-48 h-48">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="#e5e7eb"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="url(#gradient)"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={553}
                                            strokeDashoffset={553 - (553 * percentage) / 100}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-bold text-gray-900">{percentage}%</span>
                                        <span className="text-gray-500 text-sm">{score} of {totalQuestions}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Message */}
                            <div className={`${performance.bgColor} rounded-2xl p-6 text-center mb-6`}>
                                <p className={`text-lg font-medium ${performance.textColor}`}>
                                    {performance.message}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-green-50 rounded-2xl p-4 text-center">
                                    <p className="text-3xl font-bold text-green-600">{score}</p>
                                    <p className="text-sm text-green-700">Correct</p>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-4 text-center">
                                    <p className="text-3xl font-bold text-red-600">{totalQuestions - score}</p>
                                    <p className="text-sm text-red-700">Incorrect</p>
                                </div>
                                <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                                    <p className="text-3xl font-bold text-indigo-600">{totalQuestions}</p>
                                    <p className="text-sm text-indigo-700">Total</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={resetQuiz}
                                    className="flex-1 py-4 px-6 rounded-2xl font-semibold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={startNewQuiz}
                                    className="flex-1 py-4 px-6 rounded-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
                                >
                                    New Quiz
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </span>
                            Review Answers
                        </h3>

                        <div className="space-y-6">
                            {result.mcqs.map((mcq, i) => {
                                const cleanOptions = mcq.options.map(opt => opt.replace(/\n/g, ' ').trim());
                                const isCorrect = userAnswers[i] === mcq.answer;
                                const userAnswer = userAnswers[i];

                                return (
                                    <div 
                                        key={i} 
                                        className={`rounded-2xl p-6 border-2 ${
                                            isCorrect 
                                                ? 'bg-green-50 border-green-200' 
                                                : 'bg-red-50 border-red-200'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                                isCorrect ? 'bg-green-200' : 'bg-red-200'
                                            }`}>
                                                {isCorrect ? (
                                                    <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-3">
                                                    Q{i + 1}. {mcq.question}
                                                </p>
                                                <div className="space-y-2">
                                                    {cleanOptions.map((opt, idx) => {
                                                        const optionKey = opt[0];
                                                        const isCorrectOption = optionKey === mcq.answer;
                                                        const isUserSelection = optionKey === userAnswer;

                                                        return (
                                                            <div 
                                                                key={idx}
                                                                className={`p-3 rounded-xl text-sm ${
                                                                    isCorrectOption 
                                                                        ? 'bg-green-200 text-green-900 font-medium' 
                                                                        : isUserSelection && !isCorrect
                                                                            ? 'bg-red-200 text-red-900'
                                                                            : 'bg-white/50 text-gray-700'
                                                                }`}
                                                            >
                                                                {opt}
                                                                {isCorrectOption && <span className="ml-2">✓</span>}
                                                                {isUserSelection && !isCorrect && <span className="ml-2">(Your answer)</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============== QUIZ SCREEN ==============
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 sticky top-4 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">{result.note.fileName}</h1>
                                <p className="text-sm text-gray-500">{totalQuestions} Questions</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600">{answeredCount}/{totalQuestions}</p>
                            <p className="text-xs text-gray-500">Answered</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Questions */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {result.mcqs.map((mcq, i) => {
                            const cleanOptions = mcq.options.map(opt => opt.replace(/\n/g, ' ').trim());
                            const isAnswered = userAnswers[i] !== undefined;

                            return (
                                <div 
                                    key={i} 
                                    className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 ${
                                        isAnswered ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                                    }`}
                                >
                                    {/* Question Header */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                isAnswered 
                                                    ? 'bg-indigo-600 text-white' 
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {i + 1}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {isAnswered ? 'Answered' : 'Not answered'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Question Body */}
                                    <div className="p-6">
                                        <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
                                            {mcq.question}
                                        </p>

                                        <div className="space-y-3">
                                            {cleanOptions.map((opt, idx) => {
                                                const optionKey = opt[0];
                                                const optionId = `q${i}-opt${idx}`;
                                                const isSelected = userAnswers[i] === optionKey;

                                                return (
                                                    <label
                                                        key={idx}
                                                        htmlFor={optionId}
                                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                                                            isSelected
                                                                ? 'bg-indigo-50 border-2 border-indigo-500'
                                                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            id={optionId}
                                                            name={`question-${i}`}
                                                            value={optionKey}
                                                            onChange={() => handleAnswerChange(i, optionKey)}
                                                            className="hidden"
                                                        />
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                                                            isSelected
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-white border-2 border-gray-300 text-gray-600'
                                                        }`}>
                                                            {optionKey}
                                                        </div>
                                                        <span className={`flex-1 ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                                                            {opt.substring(2).trim()}
                                                        </span>
                                                        {isSelected && (
                                                            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 sticky bottom-4">
                        <button
                            type="submit"
                            disabled={answeredCount < totalQuestions}
                            className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${
                                answeredCount < totalQuestions
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1'
                            }`}
                        >
                            {answeredCount < totalQuestions 
                                ? `Answer all questions (${answeredCount}/${totalQuestions})` 
                                : '🎉 Submit Quiz'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}