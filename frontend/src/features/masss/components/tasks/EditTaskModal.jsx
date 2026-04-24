// src/features/masss/components/tasks/EditTaskModal.jsx

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { PRIORITY_OPTIONS } from './taskConstants'

export const EditTaskModal = ({ open, task, onClose, onSave,exams, submitting }) => {
const [form, setForm] = useState({
  name:                '',
  description:         '',
  priority:            'medium',
  difficulty:          3,
  estimated_pomodoros: 2,
  deadline:            '',
  exam_id:             '',
})

  // Pre-populate whenever a different task is passed in
  useEffect(() => {
    if (!task) return
    setForm({
      name:                task.name                || '',
      description:         task.description         || '',
      priority:            task.priority            || 'medium',
      difficulty:          task.difficulty          || 3,
      estimated_pomodoros: task.estimatedPomodoros  || task.estimated_pomodoros || 2,
      // Convert ISO string → datetime-local format (YYYY-MM-DDTHH:mm)
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 16)
        : '',
        exam_id: task.examId || task.exam_id || '',
    })
  }, [task])

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSave(task._id, {
      name:                form.name,
      description:         form.description  || undefined,
      priority:            form.priority,
      difficulty:          form.difficulty,
      estimated_pomodoros: form.estimated_pomodoros,
      deadline:            form.deadline
        ? new Date(form.deadline).toISOString()
        : undefined,
        exam_id:             form.exam_id || undefined,
    })
  }

  if (!open || !task) return null

  return (
    <div
      className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-masss-white rounded-2xl p-6 w-full max-w-md border border-masss-mint shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-masss-heading">Edit Task</h2>
            <p className="text-xs text-masss-heading/50 mt-0.5">Update this task's details.</p>
          </div>
          <button onClick={onClose} className="text-masss-heading/40 hover:text-masss-heading">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Task name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Description</label>
            <textarea
              placeholder="Optional notes…"
              rows={2}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
              >
                {PRIORITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                Difficulty — {form.difficulty}/5
              </label>
              <input
                type="range"
                min={1} max={5}
                value={form.difficulty}
                onChange={e => set('difficulty', Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-masss-mint accent-masss-accent mt-2"
              />
              <div className="flex justify-between text-[10px] text-masss-heading/40 mt-0.5">
                <span>Easy</span><span>Hard</span>
              </div>
            </div>

            {/* Pomodoros */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Pomodoros</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => set('estimated_pomodoros', Math.max(1, form.estimated_pomodoros - 1))}
                  className="w-8 h-8 rounded-lg bg-masss-bg border border-masss-mint text-masss-heading/60 hover:text-masss-heading transition-colors text-base"
                >
                  −
                </button>
                <span className="text-sm font-semibold text-masss-heading tabular-nums w-6 text-center">
                  {form.estimated_pomodoros}
                </span>
                <button
                  type="button"
                  onClick={() => set('estimated_pomodoros', Math.min(20, form.estimated_pomodoros + 1))}
                  className="w-8 h-8 rounded-lg bg-masss-bg border border-masss-mint text-masss-heading/60 hover:text-masss-heading transition-colors text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Deadline</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
              />
            </div>

           
          </div>

 {exams?.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Link to exam</label>
              <select
                value={form.exam_id}
                onChange={e => set('exam_id', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
              >
                <option value="">No exam link</option>
                {exams.map(ex => (
                  <option key={ex._id} value={ex._id}>{ex.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}