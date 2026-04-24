// src/features/masss/components/tasks/TaskRow.jsx

import React, { useState, useRef, useEffect } from 'react'
import {
  CheckCircle, RotateCcw,
  MoreHorizontal, Pencil, Trash2,
} from 'lucide-react'

const PRIORITY_PILL_CLASSES = {
  high:   'border border-red-200 text-red-500',
  medium: 'border border-masss-mint text-masss-heading/60',
  low:    'border border-masss-mint text-masss-heading/40',
}

export const TaskRow = ({ task, onFocus, onComplete, onArchive, onEdit, moduleName }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isCompleted = task.status === 'completed'

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 bg-masss-white border border-masss-mint rounded-xl hover:border-masss-accent/40 transition-colors">

      {/* ── Left: name + meta ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold mb-1.5 truncate ${
          isCompleted ? 'text-masss-heading/40 line-through' : 'text-masss-heading'
        }`}>
          {task.name}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority pill */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-transparent ${
            PRIORITY_PILL_CLASSES[task.priority] || PRIORITY_PILL_CLASSES.medium
          }`}>
            {task.priority}
          </span>

          {/* Sessions count */}
          <span className="text-xs text-masss-heading/40">
            Sessions {task.sessionsCount || 0}
          </span>

          {/* Module name */}
          {moduleName && (
            <span className="text-xs text-masss-heading/30">· {moduleName}</span>
          )}
        </div>
      </div>

      {/* ── Right: action button + three-dot menu ──────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Primary action — hidden for completed tasks */}
        {!isCompleted && (
          <button
            onClick={() => onFocus(task._id)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-masss-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <RotateCcw size={12} />
            {task.status === 'in_progress' ? 'In Progress' : 'Focus'}
          </button>
        )}

        {/* Three-dot menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="p-1.5 rounded-lg text-masss-heading/30 hover:text-masss-heading hover:bg-masss-bg transition-all"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-masss-white border border-masss-mint rounded-xl shadow-lg overflow-hidden">

              {/* Edit — available on any non-archived task */}
              {task.status !== 'archived' && (
                <button
                  onClick={() => { onEdit(task); setMenuOpen(false) }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-masss-heading hover:bg-masss-bg transition-colors"
                >
                  <Pencil size={13} className="text-masss-heading/40" />
                  Edit
                </button>
              )}


              {/* Delete (= archive) — available on any non-archived task */}
              {task.status !== 'archived' && (
                <>
                  <div className="h-px bg-masss-mint mx-2" />
                  <button
                    onClick={() => { onArchive(task._id); setMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  )
}