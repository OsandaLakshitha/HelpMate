// frontend/src/features/masss/pages/ModuleDetailPage.jsx

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, CheckCircle, Clock, Trash2, X } from 'lucide-react'
import { PageWrapper, PageLoader, PageError } from '../components/layout/PageWrapper'
import { useModule } from '../hooks/useModule'
import { useTasks }  from '../hooks/useTasks'
import { deadlineLabel, priorityColour, statusLabel } from '../utils/formatters'

export default function ModuleDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { module, loading: mLoading, error: mError, refetch: mRefetch } = useModule(id)
  const { tasks, loading: tLoading, createTask, archiveTask } = useTasks({ moduleId: id })

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm]         = useState({
    name: '', priority: 'medium', difficulty: 3, estimated_pomodoros: 2, deadline: '',
  })
  const [submitting, setSubmitting]     = useState(false)

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await createTask({ ...taskForm, module_id: id })
      setShowTaskForm(false)
      setTaskForm({ name: '', priority: 'medium', difficulty: 3, estimated_pomodoros: 2, deadline: '' })
    } finally {
      setSubmitting(false)
    }
  }

  if (mLoading || tLoading) return <PageLoader />
  if (mError) return <PageError message={mError} onRetry={mRefetch} />
  if (!module) return <PageError message="Module not found" />

  const activeTasks    = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/masss/modules')}
          className="p-2 rounded-lg border border-masss-mint text-masss-heading/60 hover:bg-masss-bg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: module.color || '#0FA89E' }}
        >
          <span className="text-white font-bold text-sm">{module.name?.[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-masss-heading truncate">{module.name}</h1>
          <p className="text-sm text-masss-accent capitalize">
            {module.category?.replace('_', ' ')} · {module.energyTime}
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      {/* Exams */}
      {module.exams?.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-3">Exams</p>
          <div className="flex gap-3 flex-wrap">
            {module.exams.map(exam => (
              <div key={exam._id} className="px-4 py-2.5 bg-masss-white border border-masss-mint rounded-xl">
                <p className="text-sm font-semibold text-masss-heading">{exam.name}</p>
                <p className="text-xs text-masss-accent mt-0.5">
                  {deadlineLabel(exam.dueDate)} · {exam.weight}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active tasks */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-3">
          Active tasks ({activeTasks.length})
        </p>
        {activeTasks.length === 0 ? (
          <div className="p-8 text-center bg-masss-white border border-masss-mint rounded-2xl">
            <p className="text-sm text-masss-heading/40">No active tasks. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-4 bg-masss-white border border-masss-mint rounded-xl group"
              >
                <div className={[
                  'w-2 h-2 rounded-full shrink-0',
                  task.status === 'in_progress' ? 'bg-masss-accent animate-pulse' : 'bg-masss-mint',
                ].join(' ')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-masss-heading truncate">{task.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-600' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-masss-mint text-masss-accent'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-masss-heading/40">
                      {task.sessionsCount}/{task.estimatedPomodoros} pomos
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1 text-xs text-masss-heading/40">
                        <Clock size={10} />
                        {deadlineLabel(task.deadline)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => archiveTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-masss-heading/30 hover:text-masss-danger transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-3">
            Completed ({completedTasks.length})
          </p>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task._id} className="flex items-center gap-3 p-3 bg-masss-bg border border-masss-mint rounded-xl opacity-60">
                <CheckCircle size={16} className="text-masss-accent shrink-0" />
                <p className="text-sm text-masss-heading/60 line-through truncate">{task.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add task modal */}
      {showTaskForm && (
        <div
          className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTaskForm(false)}
        >
          <div
            className="bg-masss-white rounded-2xl p-6 w-full max-w-md border border-masss-mint shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-masss-heading">Add Task</h2>
              <button onClick={() => setShowTaskForm(false)} className="text-masss-heading/40 hover:text-masss-heading">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task name *"
                value={taskForm.name}
                onChange={e => setTaskForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-masss-heading/50 mb-1 block">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                  >
                    {['high','medium','low'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-masss-heading/50 mb-1 block">Difficulty (1-5)</label>
                  <input
                    type="number" min={1} max={5}
                    value={taskForm.difficulty}
                    onChange={e => setTaskForm(p => ({ ...p, difficulty: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-masss-heading/50 mb-1 block">Pomodoros</label>
                  <input
                    type="number" min={1}
                    value={taskForm.estimated_pomodoros}
                    onChange={e => setTaskForm(p => ({ ...p, estimated_pomodoros: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-masss-heading/50 mb-1 block">Deadline</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={e => setTaskForm(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90"
                >
                  {submitting ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}