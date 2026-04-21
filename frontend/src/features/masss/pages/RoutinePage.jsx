// frontend/src/features/masss/pages/RoutinePage.jsx

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useProfile } from '../hooks/useProfile'

const DAYS       = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const ACTIVITIES = ['class','work','habit','sleep']

const ACTIVITY_BADGE = {
  class:  'bg-masss-mint text-masss-accent',
  work:   'bg-amber-100 text-amber-600',
  habit:  'bg-purple-100 text-purple-600',
  sleep:  'bg-slate-100 text-slate-500',
}

export default function RoutinePage() {
  const { routine, loading, error, addRoutineEvent, deleteRoutineEvent, refetch } = useProfile()

  const [showForm,   setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form,       setForm]       = useState({
    name: '', activity_type: 'class', days: [], start_time: '09:00', end_time: '11:00',
  })

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.days.length === 0) return
    try {
      setSubmitting(true)
      await addRoutineEvent(form)
      setShowForm(false)
      setForm({ name: '', activity_type: 'class', days: [], start_time: '09:00', end_time: '11:00' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <div className="max-w-lg space-y-4">

      {/* Add button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-masss-mint text-masss-accent text-sm font-medium hover:bg-masss-bg transition-colors"
      >
        <Plus size={16} />
        Add routine event
      </button>

      {/* Event list */}
      {routine.length === 0 && !showForm ? (
        <EmptyState
          title="No routine events"
          subtitle="Add lectures, work shifts, or habits to help the scheduler avoid conflicts"
        />
      ) : (
        <div className="space-y-3">
          {routine.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 p-4 bg-masss-white border border-masss-mint rounded-xl group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-masss-heading truncate">{event.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize shrink-0 ${
                    ACTIVITY_BADGE[event.activity_type] || 'bg-masss-mint text-masss-accent'
                  }`}>
                    {event.activity_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-masss-heading/50 mb-2">
                  <span>{event.start_time} – {event.end_time}</span>
                  <span className="capitalize">{event.day_of_week}</span>
                </div>
              </div>
              <button
                onClick={() => deleteRoutineEvent(event.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-masss-heading/30 hover:text-masss-danger transition-all shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-masss-white rounded-2xl p-6 w-full max-w-md border border-masss-mint shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-masss-heading">Add Routine Event</h2>
                <button onClick={() => setShowForm(false)} className="text-masss-heading/40 hover:text-masss-heading">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                <input
                  type="text"
                  placeholder="Event name *"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
                  required
                />

                <div>
                  <label className="text-xs text-masss-heading/50 mb-2 block">Activity type</label>
                  <div className="flex gap-2 flex-wrap">
                    {ACTIVITIES.map(a => (
                      <button
                        type="button"
                        key={a}
                        onClick={() => setForm(p => ({ ...p, activity_type: a }))}
                        className={[
                          'px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors',
                          form.activity_type === a
                            ? 'bg-masss-accent text-white border-masss-accent'
                            : 'bg-masss-bg text-masss-heading/60 border-masss-mint hover:border-masss-accent',
                        ].join(' ')}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-masss-heading/50 mb-2 block">
                    Days * ({form.days.length} selected)
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS.map(d => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={[
                          'px-2.5 py-1 rounded-md text-xs font-medium border capitalize transition-colors',
                          form.days.includes(d)
                            ? 'bg-masss-accent text-white border-masss-accent'
                            : 'bg-masss-bg text-masss-heading/60 border-masss-mint hover:border-masss-accent',
                        ].join(' ')}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-masss-heading/50 mb-1 block">Start</label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-masss-heading/50 mb-1 block">End</label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !form.name.trim() || form.days.length === 0}
                    className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                  >
                    {submitting ? 'Adding...' : 'Add Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}