// src/pages/user/MyNotes.jsx
import React, { useEffect, useState } from 'react';

export default function MyNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/notes/list', {
                    credentials: 'include'
                });
                const data = await res.json();
                setNotes(data.notes || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    if (loading) return <p className="p-6">Loading your notes...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Your Uploaded Notes</h1>
            {notes.length === 0 ? (
                <p>No notes uploaded yet.</p>
            ) : (
                <div className="space-y-4">
                    {notes.map(note => (
                        <div key={note.id} className="border p-4 rounded-lg hover:shadow-md transition">
                            <h3 className="font-medium">{note.fileName}</h3>
                            <p className="text-sm text-gray-600">{note.contentPreview}</p>
                            <p className="text-xs text-gray-500">Uploaded on {new Date(note.uploadedAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}