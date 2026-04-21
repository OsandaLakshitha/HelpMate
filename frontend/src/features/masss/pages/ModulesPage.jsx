// frontend/src/features/masss/pages/ModulesPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookOpen, ChevronRight, Trash2, X } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useModules } from '../hooks/useModules'

const CATEGORIES = ['coding','math_logic','language','creative_design','memorization','other']
const ENERGY_TIMES = ['morning','afternoon','evening']
const COLOURS = ['#0FA89E','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#10B981','#EC4899','#6366F1']

export default function ModulesPage() {
  const navigate                               = useNavigate()
  const { modules, loading, error, createModule, deleteModule, refetch } = useModules()
  const [showModal, setShowModal]              = useState(false)
  const [formError, setFormError]              = useState(null)
  const [submitting, setSubmitting]            = useState(false)
  const [form, setForm]                        = useState({
    name: '', category: 'other', color: '#0FA89E', energy_time: 'afternoon',
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      setSubmitting(true)
      setFormError(null)
      await createModule(form)
      setShowModal(false)
      setForm({ name: '', category: 'other', color: '#0FA89E', energy_time: 'afternoon' })
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

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <PageWrapper>
      <PageHeader
        title="Modules"
        subtitle="Your study modules"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            New Module
          </button>
        }
      />

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => {
            const doneTasks  = (mod.tasks || []).filter(t => t.status === 'completed').length
            const totalTasks = (mod.tasks || []).length
            const progress   = totalTasks > 0 ? doneTasks / totalTasks : 0

            return (
              <motion.div
                key={mod._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/masss/modules/${mod._id}`)}
                className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: mod.color || '#0FA89E' }}
                  >
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <button
                    onClick={e => handleDelete(e, mod._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-masss-heading/30 hover:text-masss-danger transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-masss-heading mb-1 truncate">{mod.name}</h3>
                <p className="text-xs text-masss-heading/50 capitalize mb-4">
                  {mod.category?.replace('_', ' ')} · {mod.energyTime || mod.energy_time}
                </p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-masss-heading/50">{doneTasks}/{totalTasks} tasks</span>
                    <span className="text-masss-accent font-medium">{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: mod.color || '#0FA89E' }}
                    />
                  </div>
                </div>

                {/* Exams count */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-masss-heading/40">
                    {(mod.exams || []).length} exam{(mod.exams || []).length !== 1 ? 's' : ''}
                  </span>
                  <ChevronRight size={14} className="text-masss-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Module Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-masss-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-masss-mint"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-masss-heading">New Module</h2>
                <button onClick={() => setShowModal(false)} className="text-masss-heading/40 hover:text-masss-heading">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Module Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Advanced Mathematics"
                    className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent capitalize"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Best Study Time</label>
                  <div className="flex gap-2">
                    {ENERGY_TIMES.map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setForm(p => ({ ...p, energy_time: t }))}
                        className={[
                          'flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors',
                          form.energy_time === t
                            ? 'bg-masss-accent text-white border-masss-accent'
                            : 'bg-masss-bg text-masss-heading/60 border-masss-mint hover:border-masss-accent',
                        ].join(' ')}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">Colour</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOURS.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setForm(p => ({ ...p, color: c }))}
                        className={[
                          'w-7 h-7 rounded-full transition-all',
                          form.color === c ? 'ring-2 ring-offset-2 ring-masss-accent scale-110' : '',
                        ].join(' ')}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                {formError && <p className="text-xs text-masss-danger">{formError}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !form.name.trim()}
                    className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                  >
                    {submitting ? 'Creating...' : 'Create Module'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}