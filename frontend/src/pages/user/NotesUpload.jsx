// src/pages/user/NotesUpload.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
export default function NotesUpload() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    
    // Tags and module info
    const [moduleCode, setModuleCode] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    
    // Generation settings
    const [numQuestions, setNumQuestions] = useState(20);
    const [numFlashCards, setNumFlashCards] = useState(10);
    
    // Progress tracking
    const [progress, setProgress] = useState({ stage: '', percent: 0 });
    
    const fileInputRef = useRef(null);
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
    const addTag = () => {
        const tag = tagInput.trim().toUpperCase();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput('');
        }
    };
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };
    const handleUpload = async () => {
        if (!file) {
            setError('Please select a PDF file');
            return;
        }
        const formData = new FormData();
        formData.append('lectureNote', file);
        formData.append('moduleCode', moduleCode);
        formData.append('moduleName', moduleName);
        formData.append('tags', JSON.stringify(tags));
        formData.append('numQuestions', numQuestions.toString());
        formData.append('numFlashCards', numFlashCards.toString());
        setUploading(true);
        setError('');
        setProgress({ stage: 'Uploading PDF...', percent: 10 });
        
        // Simulate progress stages
        const progressStages = [
            { stage: 'Extracting text from PDF...', percent: 20, delay: 1000 },
            { stage: 'Generating MCQs with AI...', percent: 40, delay: 3000 },
            { stage: 'Creating Flash Cards...', percent: 70, delay: 5000 },
            { stage: 'Generating Short Notes...', percent: 85, delay: 2000 },
            { stage: 'Saving to database...', percent: 95, delay: 1000 },
        ];
        
        // Start progress animation
        let stageIndex = 0;
        const progressInterval = setInterval(() => {
            if (stageIndex < progressStages.length) {
                setProgress(progressStages[stageIndex]);
                stageIndex++;
            }
        }, 3000);
        
        try {
            const data = await api.post('/api/notes/upload', formData);
            
            clearInterval(progressInterval);
            setProgress({ stage: 'Complete!', percent: 100 });
            
            setTimeout(() => {
                navigate(`/user/notes/${data.note.id}`, { 
                    state: { 
                        note: data.note,
                        mcqs: data.mcqs,
                        shortNotes: data.shortNotes,
                        flashCards: data.flashCards,
                        isNew: true 
                    }
                });
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.message || 'Upload failed');
            setProgress({ stage: '', percent: 0 });
        } finally {
            setUploading(false);
        }
    };
    const suggestedTags = ['LECTURE', 'TUTORIAL', 'LAB', 'EXAM', 'ASSIGNMENT', 'NOTES', 'MIDTERM', 'FINAL'];
    // Custom slider style
    const sliderStyle = `
        .custom-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 4px;
            outline: none;
            cursor: pointer;
        }
        .custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .custom-slider.indigo::-webkit-slider-thumb {
            background: #4f46e5;
        }
        .custom-slider.purple::-webkit-slider-thumb {
            background: #9333ea;
        }
        .custom-slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .custom-slider.indigo::-moz-range-thumb {
            background: #4f46e5;
        }
        .custom-slider.purple::-moz-range-thumb {
            background: #9333ea;
        }
    `;
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
            <style>{sliderStyle}</style>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Lecture Notes</h1>
                    <p className="text-gray-600">
                        Hi {user?.firstName || 'there'}! Upload your notes to generate study materials
                    </p>
                </div>
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                    {/* Module Info */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Module Information (Optional)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Module Code (e.g., IT3080)"
                                value={moduleCode}
                                onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Module Name"
                                value={moduleName}
                                onChange={(e) => setModuleName(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    {/* Tags */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tags (Optional)
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Add a tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors font-medium"
                            >
                                Add
                            </button>
                        </div>
                        
                        {/* Suggested Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {suggestedTags.filter(t => !tags.includes(t)).slice(0, 5).map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setTags([...tags, tag])}
                                    className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                        
                        {/* Selected Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center text-indigo-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Generation Settings - SLIDERS */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                        <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Generation Settings
                        </h3>
                        
                        {/* MCQ Slider */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <span className="text-xl">📝</span> Number of MCQs
                                </label>
                                <span className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-full min-w-[50px] text-center">
                                    {numQuestions}
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    step="5"
                                    value={numQuestions}
                                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                    className="custom-slider indigo"
                                    style={{
                                        background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((numQuestions - 5) / 25) * 100}%, #e0e7ff ${((numQuestions - 5) / 25) * 100}%, #e0e7ff 100%)`
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                <span>5</span>
                                <span>10</span>
                                <span>15</span>
                                <span>20</span>
                                <span>25</span>
                                <span>30</span>
                            </div>
                        </div>
                        
                        {/* Flash Cards Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <span className="text-xl">🎴</span> Number of Flash Cards
                                </label>
                                <span className="px-4 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-full min-w-[50px] text-center">
                                    {numFlashCards}
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="range"
                                    min="5"
                                    max="25"
                                    step="5"
                                    value={numFlashCards}
                                    onChange={(e) => setNumFlashCards(parseInt(e.target.value))}
                                    className="custom-slider purple"
                                    style={{
                                        background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((numFlashCards - 5) / 20) * 100}%, #f3e8ff ${((numFlashCards - 5) / 20) * 100}%, #f3e8ff 100%)`
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                <span>5</span>
                                <span>10</span>
                                <span>15</span>
                                <span>20</span>
                                <span>25</span>
                            </div>
                        </div>
                    </div>
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
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Generate {numQuestions} MCQs & {numFlashCards} Flash Cards
                            </span>
                        )}
                    </button>
                    {/* Progress Bar */}
                    {uploading && progress.stage && (
                        <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-indigo-800">{progress.stage}</span>
                                <span className="text-sm font-bold text-indigo-600">{progress.percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress.percent}%` }}
                                />
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                <svg className="w-4 h-4 animate-pulse text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                AI is analyzing your document and generating study materials...
                            </div>
                        </div>
                    )}
                    {/* Features Summary */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <span className="text-2xl">📝</span>
                            <p className="text-sm font-medium text-gray-900 mt-2">MCQs</p>
                            <p className="text-xs text-indigo-600 font-semibold">{numQuestions} questions</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <span className="text-2xl">📋</span>
                            <p className="text-sm font-medium text-gray-900 mt-2">Short Notes</p>
                            <p className="text-xs text-blue-600 font-semibold">Auto-generated</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
                            <span className="text-2xl">🎴</span>
                            <p className="text-sm font-medium text-gray-900 mt-2">Flash Cards</p>
                            <p className="text-xs text-purple-600 font-semibold">{numFlashCards} cards</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}