// src/features/masss/components/modules/ModuleCard.jsx

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Pencil, Trash2, ChevronRight, Calendar, AlertTriangle } from 'lucide-react'
import { getCategoryLabel } from './moduleConstants'

export const ModuleCard = ({ mod, index, onClick, onEdit, onDelete }) => {
  const tasks      = mod.tasks || []
  const doneTasks  = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const totalTasks = tasks.length
  const progress   = totalTasks > 0 ? doneTasks / totalTasks : 0
  const color      = mod.color || '#0FA89E'
  const examCount  = (mod.exams || []).length

  const [menuOpen,   setMenuOpen]   = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const menuRef = useRef(null)

  // Close menu when clicking outside
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

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setMenuOpen(prev => !prev)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit(mod)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async (e) => {
    e.stopPropagation()
    try {
      setDeleting(true)
      await onDelete(mod._id)
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setConfirmOpen(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        // transition={{ delay: index * 0.05 }}
        // whileHover={{ y: confirmOpen ? 0 : -2 }}
        onClick={onClick}
        className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer group relative"
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          {/* Colour dot */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: color + '20', border: `1px solid ${color}35` }}
          >
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: color }} />
          </div>

          {/* Three-dot menu */}
          <div ref={menuRef} className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={handleMenuToggle}
              className="p-1.5 rounded-lg text-masss-heading/30 hover:text-masss-heading hover:bg-masss-bg transition-all opacity-0 group-hover:opacity-100"
              title="Options"
            >
              <MoreVertical size={15} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-8 z-20 w-36 bg-masss-white border border-masss-mint rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-masss-heading hover:bg-masss-bg transition-colors"
                  >
                    <Pencil size={13} className="text-masss-heading/50" />
                    Edit
                  </button>
                  <div className="h-px bg-masss-mint mx-2" />
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Name + category */}
        <h3 className="font-semibold text-masss-heading mb-0.5 truncate">{mod.name}</h3>
        <p className="text-xs text-masss-heading/50 mb-4">{getCategoryLabel(mod.category)}</p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-masss-heading/50">{doneTasks}/{totalTasks} tasks</span>
            <span className="font-medium" style={{ color }}>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-masss-heading/40">
          <div className="flex items-center gap-2.5">
            {inProgress > 0 && (
              <span className="flex items-center gap-1 text-masss-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-masss-accent animate-pulse" />
                {inProgress} active
              </span>
            )}
            {examCount > 0 && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {examCount} exam{examCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="capitalize">{mod.energyTime || mod.energy_time}</span>
            <ChevronRight
              size={12}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Delete confirmation dialog ──────────────────────────────────────── */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-masss-white border border-masss-mint rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
              </div>

              <h3 className="text-base font-bold text-masss-heading mb-1">
                Delete "{mod.name}"?
              </h3>
              <p className="text-xs text-masss-heading/50 mb-6 leading-relaxed">
                This will permanently delete the module and all its tasks. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-masss-mint text-masss-heading/60 text-sm font-medium hover:bg-masss-bg transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40"
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}