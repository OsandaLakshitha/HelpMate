// frontend/src/features/masss/pages/ModulesPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookOpen, ChevronRight, Trash2, X, Calendar } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useModules } from '../hooks/useModules'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'coding',          label: 'Coding' },
  { value: 'math_logic',      label: 'Math / Logic' },
  { value: 'language',        label: 'Language' },
  { value: 'creative_design', label: 'Creative Design' },
  { value: 'memorization',    label: 'Memorization' },
  { value: 'other',           label: 'Other' },
]

const EXAM_TYPE_OPTIONS = [
  { value: 'final',        label: 'Final Exam' },
  { value: 'midterm',      label: 'Midterm' },
  { value: 'quiz',         label: 'Quiz' },
  { value: 'assignment',   label: 'Assignment' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'other',        label: 'Other' },
]

const ENERGY_TIMES = ['morning', 'afternoon', 'evening']
const COLOURS = ['#0FA89E','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#10B981','#EC4899','#6366F1']

const getCategoryLabel = (value) =>
  CATEGORY_OPTIONS.find(o => o.value === value)?.label || value

const EMPTY_MODULE = { name: '', category: 'other', color: '#0FA89E', energy_time: 'afternoon' }
const EMPTY_EXAM   = { name: '', exam_type: 'quiz', due_date: '', weight: 10 }

// ── Module Card ───────────────────────────────────────────────────────────────

const ModuleCard = ({ mod, index, onDelete, onClick }) => {
  const tasks      = mod.tasks || []
  const doneTasks  = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const totalTasks = tasks.length
  const progress   = totalTasks > 0 ? doneTasks / totalTasks : 0
  const color      = mod.color || '#0FA89E'
  const examCount  = (mod.exams || []).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '20', border: `1px solid ${color}35` }}
        >
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: color }} />
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-masss-heading/30 hover:text-red-500 transition-all"
        >
          <Trash2 size={14} />
        </button>
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
  )
}

// ── Modules Page ──────────────────────────────────────────────────────────────

export default function ModulesPage() {
  const navigate = useNavigate()
  const { modules, loading, error, createModule, deleteModule, refetch } = useModules()

  // Modal state
  const [showModal,  setShowModal]  = useState(false)
  const [step,       setStep]       = useState(1)

  // Module form
  const [form,       setForm]       = useState(EMPTY_MODULE)

  // Exam builder
  const [examForm,   setExamForm]   = useState(EMPTY_EXAM)
  const [exams,      setExams]      = useState([])

  // Submission
  const [formError,  setFormError]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClose = () => {
    setShowModal(false)
    setStep(1)
    setForm(EMPTY_MODULE)
    setExamForm(EMPTY_EXAM)
    setExams([])
    setFormError(null)
  }

  const handleAddExam = () => {
    if (!examForm.name.trim()) { setFormError('Enter an exam name'); return }
    if (!examForm.due_date)    { setFormError('Select a due date');   return }
    setFormError(null)
    setExams(prev => [...prev, { ...examForm }])
    setExamForm(EMPTY_EXAM)
  }

  const removeExam = (i) => setExams(prev => prev.filter((_, idx) => idx !== i))

  const handleCreate = async () => {
    try {
      setSubmitting(true)
      setFormError(null)
      await createModule({ ...form, exams })
      handleClose()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this module and all its tasks?')) return
    await deleteModule(id)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <PageWrapper>
     

      {modules.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No modules yet"
          subtitle="Create a module to organise your study tasks"
          action={
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              Create your first module
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 m-6">
          {modules.map((mod, i) => (
            <ModuleCard
              key={mod._id}
              mod={mod}
              index={i}
              onClick={() => navigate(`/masss/modules/${mod._id}`)}
              onDelete={e => handleDelete(e, mod._id)}
            />
          ))}
        </div>
      )}

      {/* ── Create Module Modal (2-step) ────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-masss-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-masss-mint"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-masss-heading">
                  {step === 1 ? 'New Module' : 'Add Exams'}
                </h2>
                <button onClick={handleClose} className="text-masss-heading/40 hover:text-masss-heading">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-masss-heading/50 mb-5">
                {step === 1
                  ? 'Add a subject or course to organise your tasks.'
                  : 'Attach upcoming exams to this module. Optional — you can skip this.'}
              </p>

              <AnimatePresence mode="wait">

                {/* ── Step 1: Module details ───────────────────────────── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                        Module Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Advanced Mathematics"
                        className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                          Category
                        </label>
                        <select
                          value={form.category}
                          onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                        >
                          {CATEGORY_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                          Best Study Time
                        </label>
                        <select
                          value={form.energy_time}
                          onChange={e => setForm(p => ({ ...p, energy_time: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent capitalize"
                        >
                          {ENERGY_TIMES.map(t => (
                            <option key={t} value={t} className="capitalize">{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                        Colour
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {COLOURS.map(c => (
                          <button
                            type="button"
                            key={c}
                            onClick={() => setForm(p => ({ ...p, color: c }))}
                            className={[
                              'w-7 h-7 rounded-lg transition-all duration-150',
                              form.color === c
                                ? 'ring-2 ring-white/60 scale-110'
                                : 'opacity-70 hover:opacity-100 hover:scale-105',
                            ].join(' ')}
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!form.name.trim()}
                        onClick={() => setStep(2)}
                        className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                      >
                        Next — Add Exams
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Exams ────────────────────────────────────── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    {/* Exam builder form */}
                    <div className="bg-masss-bg border border-masss-mint rounded-xl p-3 space-y-2.5">
                      <input
                        type="text"
                        placeholder="Exam name"
                        value={examForm.name}
                        onChange={e => setExamForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-white focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={examForm.exam_type}
                          onChange={e => setExamForm(p => ({ ...p, exam_type: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-white focus:outline-none focus:border-masss-accent"
                        >
                          {EXAM_TYPE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Weight %"
                          min={1} max={100}
                          value={examForm.weight}
                          onChange={e => setExamForm(p => ({ ...p, weight: Number(e.target.value) }))}
                          className="px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-white focus:outline-none focus:border-masss-accent"
                        />
                      </div>
                      <input
                        type="date"
                        value={examForm.due_date}
                        onChange={e => setExamForm(p => ({ ...p, due_date: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-white focus:outline-none focus:border-masss-accent"
                      />
                      <button
                        type="button"
                        onClick={handleAddExam}
                        className="w-full py-2 rounded-lg border border-masss-accent text-masss-accent text-sm font-semibold hover:bg-masss-accent hover:text-white transition-colors"
                      >
                        + Add Exam
                      </button>
                    </div>

                    {/* Added exams list */}
                    {exams.length > 0 && (
                      <div className="space-y-1.5">
                        {exams.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2 bg-masss-white border border-masss-mint rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-masss-heading truncate">{ex.name}</p>
                              <p className="text-xs text-masss-heading/50">{ex.due_date} · {ex.weight}%</p>
                            </div>
                            <button
                              onClick={() => removeExam(i)}
                              className="text-masss-heading/30 hover:text-red-500 transition-colors p-1 text-base leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formError && (
                      <p className="text-xs text-red-500">{formError}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setFormError(null) }}
                        className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleCreate}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors disabled:opacity-40"
                      >
                        {submitting ? 'Creating…' : 'Skip Exams'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCreate}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                      >
                        {submitting ? 'Creating…' : 'Create Module'}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}