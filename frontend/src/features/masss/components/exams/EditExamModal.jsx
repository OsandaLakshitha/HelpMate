import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, CheckSquare, Square } from 'lucide-react'
import { EXAM_TYPE_OPTIONS } from './examConstants'

export const EditExamModal = ({ open, exam, onClose, onSave, submitting, tasks = [] }) => {
  const [form, setForm] = useState({
    name:      '',
    exam_type: 'quiz',
    due_date:  '',
    weight:    10,
  })
  const [selectedTaskIds, setSelectedTaskIds] = useState([])

  // Pre-populate when exam changes
  useEffect(() => {
    if (!exam) return
    setForm({
      name:      exam.name                          || '',
      exam_type: exam.examType  || exam.exam_type   || 'quiz',
      due_date:  exam.dueDate   || exam.due_date
        ? new Date(exam.dueDate || exam.due_date).toISOString().slice(0, 10)
        : '',
      weight:    exam.weight                        || 10,
    })
    // Pre-check tasks already linked to this exam
    const linked = tasks
      .filter(t => (t.examId || t.exam_id) === exam._id)
      .map(t => t._id)
    setSelectedTaskIds(linked)
  }, [exam])

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const toggleTask = (taskId) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSave(exam._id, {
      name:      form.name,
      exam_type: form.exam_type,
      due_date:  form.due_date,
      weight:    form.weight,
      task_ids:  selectedTaskIds,
    })
  }

  if (!open || !exam) return null

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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-masss-heading">Edit Exam</h2>
            <p className="text-xs text-masss-heading/50 mt-0.5">Update exam details and linked tasks.</p>
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

          {/* Task assignment */}
          {tasks.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                Assign tasks
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border border-masss-mint bg-masss-bg p-2">
                {tasks.map(task => {
                  const checked = selectedTaskIds.includes(task._id)
                  return (
                    <button
                      key={task._id}
                      type="button"
                      onClick={() => toggleTask(task._id)}
                      className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-masss-white transition-colors text-left"
                    >
                      {checked
                        ? <CheckSquare size={14} className="text-masss-accent shrink-0" />
                        : <Square     size={14} className="text-masss-heading/30 shrink-0" />
                      }
                      <span className={`text-xs truncate ${
                        checked ? 'text-masss-heading font-medium' : 'text-masss-heading/60'
                      }`}>
                        {task.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedTaskIds.length > 0 && (
                <p className="text-[10px] text-masss-accent mt-1">
                  {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} linked
                </p>
              )}
            </div>
          )}

          {/* Actions */}
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
              disabled={submitting || !form.name.trim() || !form.due_date}
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