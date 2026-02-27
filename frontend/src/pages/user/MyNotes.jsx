// src/pages/user/MyNotes.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

export default function MyNotes() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [allModules, setAllModules] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchNotes();
        fetchMeta();
        fetchStats();
    }, []);

    const fetchNotes = async () => {
        try {
            const data = await api.get('/api/notes/list');
            setNotes(data.notes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeta = async () => {
        try {
            const data = await api.get('/api/notes/meta/tags');
            setAllModules(data.modules || []);
            setAllTags(data.tags || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await api.get('/api/notes/meta/stats');
            setStats(data.stats);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNote = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this note?')) return;
        
        try {
            await api.delete(`/api/notes/${id}`);
            setNotes(notes.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFavorite = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const data = await api.patch(`/api/notes/${id}/favorite`);
            setNotes(notes.map(n => 
                n.id === id ? { ...n, isFavorite: data.isFavorite } : n
            ));
        } catch (err) {
            console.error(err);
        }
    };

    // Filter notes
    const filteredNotes = notes.filter(note => {
        const matchesSearch = !searchQuery || 
            note.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.moduleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.moduleCode?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesModule = !selectedModule || note.moduleCode === selectedModule;
        const matchesTag = !selectedTag || note.tags?.includes(selectedTag);
        
        return matchesSearch && matchesModule && matchesTag;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your notes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Welcome back, {user?.firstName || 'Student'}! 👋
                            </h1>
                            <p className="text-white/80">
                                You have {notes.length} notes in your library
                            </p>
                        </div>
                        <Link
                            to="/user/notes/upload"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-semibold hover:bg-indigo-50 transition-all shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Upload Note
                        </Link>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
                            <div className="text-center">
                                <p className="text-3xl font-bold">{stats.totalNotes}</p>
                                <p className="text-sm text-white/70">Notes</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold">{stats.totalMCQs}</p>
                                <p className="text-sm text-white/70">MCQs</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold">{stats.totalFlashCards}</p>
                                <p className="text-sm text-white/70">Flash Cards</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold">{stats.totalQuizAttempts}</p>
                                <p className="text-sm text-white/70">Quizzes Taken</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Module Filter */}
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]"
                        >
                            <option value="">All Modules</option>
                            {allModules.map(m => (
                                <option key={m.code} value={m.code}>
                                    {m.code} {m.name && `- ${m.name}`}
                                </option>
                            ))}
                        </select>

                        {/* Tag Filter */}
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
                        >
                            <option value="">All Tags</option>
                            {allTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notes Grid */}
                {filteredNotes.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes found</h3>
                        <p className="text-gray-500 mb-6">
                            {notes.length === 0 
                                ? "You haven't uploaded any notes yet." 
                                : "No notes match your current filters."}
                        </p>
                        <Link
                            to="/user/notes/upload"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Upload Your First Note
                        </Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                        : "space-y-4"
                    }>
                        {filteredNotes.map(note => (
                            <Link
                                key={note.id}
                                to={`/user/notes/${note.id}`}
                                className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                                    viewMode === 'list' ? 'flex items-center gap-4 p-4' : ''
                                }`}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 relative">
                                            <button
                                                onClick={(e) => toggleFavorite(note.id, e)}
                                                className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                <svg 
                                                    className={`w-5 h-5 ${note.isFavorite ? 'text-yellow-300 fill-yellow-300' : 'text-white'}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </button>
                                            
                                            {note.moduleCode && (
                                                <span className="inline-block px-2 py-1 bg-white/20 rounded-lg text-xs text-white font-medium mb-2">
                                                    {note.moduleCode}
                                                </span>
                                            )}
                                            <h3 className="font-semibold text-white truncate pr-10">
                                                {note.fileName.replace('.pdf', '')}
                                            </h3>
                                            
                                            {note.bestScore !== null && (
                                                <span className={`absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${
                                                    note.bestScore >= 80 ? 'bg-green-400 text-green-900' :
                                                    note.bestScore >= 60 ? 'bg-yellow-400 text-yellow-900' :
                                                    'bg-red-400 text-red-900'
                                                }`}>
                                                    Best: {note.bestScore}%
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4">
                                            {note.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {note.tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                {note.contentPreview?.substring(0, 100)}...
                                            </p>

                                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                                <span className="text-xs text-gray-500">
                                                    <span className="text-indigo-600 font-semibold">{note.stats?.mcqCount || 0}</span> MCQs
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    <span className="text-purple-600 font-semibold">{note.stats?.flashCardCount || 0}</span> Cards
                                                </span>
                                                <span className="flex-1 text-right text-xs text-gray-400">
                                                    {formatDate(note.uploadedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => deleteNote(note.id, e)}
                                                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Delete Note
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* List View */
                                    <>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {note.moduleCode && (
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                        {note.moduleCode}
                                                    </span>
                                                )}
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {note.fileName.replace('.pdf', '')}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {note.contentPreview?.substring(0, 80)}...
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6 flex-shrink-0">
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-indigo-600">{note.stats?.mcqCount || 0}</p>
                                                <p className="text-xs text-gray-500">MCQs</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-purple-600">{note.stats?.flashCardCount || 0}</p>
                                                <p className="text-xs text-gray-500">Cards</p>
                                            </div>
                                            <span className="text-sm text-gray-500">{formatDate(note.uploadedAt)}</span>
                                            <button
                                                onClick={(e) => deleteNote(note.id, e)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}