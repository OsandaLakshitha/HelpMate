// src/features/masss/components/exams/CreateExamModal.jsx

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { EXAM_TYPE_OPTIONS, EMPTY_EXAM } from './examConstants'

export const CreateExamModal = ({ open, onClose, onSubmit, submitting }) => {
  const [form, setForm] = useState(EMPTY_EXAM)

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(form)
    setForm(EMPTY_EXAM)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-masss-white rounded-2xl p-6 w-full max-w-sm border border-masss-mint shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-masss-heading">Add Exam</h2>
            <p className="text-xs text-masss-heading/50 mt-0.5">Attach an exam to this module.</p>
          </div>
          <button onClick={onClose} className="text-masss-heading/40 hover:text-masss-heading">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Exam name */}
          <div>
            <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Exam name *</label>
            <input
              type="text"
              placeholder="e.g. Midterm Paper"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Type</label>
              <select
                value={form.exam_type}
                onChange={e => set('exam_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
              >
                {EXAM_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Weight %</label>
              <input
                type="number"
                min={1} max={100}
                value={form.weight}
                onChange={e => set('weight', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
              />
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Due date *</label>
            <input
              type="date"
              value={form.due_date}
              onChange={e => set('due_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name.trim() || !form.due_date}
              className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Adding…' : 'Add Exam'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}