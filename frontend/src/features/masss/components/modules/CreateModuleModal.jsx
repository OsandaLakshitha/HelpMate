// src/features/masss/components/modules/CreateModuleModal.jsx

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { CATEGORY_OPTIONS, ENERGY_TIMES, COLOURS, EMPTY_MODULE } from './moduleConstants'
import { EXAM_TYPE_OPTIONS } from '../exams/examConstants'

const EMPTY_EXAM = { name: '', exam_type: 'quiz', due_date: '', weight: 10 }

export const CreateModuleModal = ({ open, onClose, onCreate }) => {
  const [step,       setStep]       = useState(1)
  const [form,       setForm]       = useState(EMPTY_MODULE)
  const [examForm,   setExamForm]   = useState(EMPTY_EXAM)
  const [exams,      setExams]      = useState([])
  const [formError,  setFormError]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleClose = () => {
    setStep(1)
    setForm(EMPTY_MODULE)
    setExamForm(EMPTY_EXAM)
    setExams([])
    setFormError(null)
    onClose()
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
      await onCreate({ ...form, exams })
      handleClose()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
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

            {/* ── Step 1: Module details ──────────────────────────────── */}
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

            {/* ── Step 2: Exam builder ────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Exam entry form */}
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
    </AnimatePresence>
  )
}