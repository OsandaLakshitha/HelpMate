// frontend/src/features/masss/pages/ModuleDetailPage.jsx

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, CheckCircle, Clock, Trash2, X,
  Play, Timer, Circle, Calendar,
} from 'lucide-react'
import { PageWrapper, PageLoader, PageError } from '../components/layout/PageWrapper'
import { useModule } from '../hooks/useModule'
import { useTasks }  from '../hooks/useTasks'
import { deadlineLabel } from '../utils/formatters'
import massApi from '../lib/massApi'

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low' },
]

const EXAM_TYPE_OPTIONS = [
  { value: 'final',        label: 'Final Exam' },
  { value: 'midterm',      label: 'Midterm' },
  { value: 'quiz',         label: 'Quiz' },
  { value: 'assignment',   label: 'Assignment' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'other',        label: 'Other' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const priorityClasses = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low:    'bg-masss-mint text-masss-accent',
}

const daysUntilFromDate = (dateStr) =>
  dateStr
    ? Math.floor((new Date(dateStr) - Date.now()) / 86_400_000)
    : null

// ── ExamCard ──────────────────────────────────────────────────────────────────

const ExamCard = ({ exam }) => {
  // Support both MongoDB camelCase (dueDate) and snake_case (due_date)
  const due      = exam.dueDate || exam.due_date
  const daysLeft = daysUntilFromDate(due)

  const dueDateColour =
    daysLeft === null         ? 'text-masss-heading/40' :
    daysLeft <= 3             ? 'text-red-500'          :
    daysLeft <= 7             ? 'text-amber-500'        :
    'text-masss-heading/40'

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-masss-heading truncate">{exam.name}</p>
          {(exam.examType || exam.exam_type) && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-masss-mint text-masss-accent capitalize">
              {(exam.examType || exam.exam_type).replace('_', ' ')}
            </span>
          )}
          {exam.weight && (
            <span className="text-[10px] text-masss-heading/40 font-medium">{exam.weight}%</span>
          )}
        </div>
        {due && (
          <p className={`text-xs mt-0.5 flex items-center gap-1 ${dueDateColour}`}>
            <Calendar size={10} />
            {deadlineLabel(due)}
          </p>
        )}
      </div>

      {(exam.isCompleted || exam.is_completed) && (
        <CheckCircle size={15} className="text-masss-accent shrink-0" />
      )}
    </div>
  )
}

// ── Task Row ──────────────────────────────────────────────────────────────────

const TaskRow = ({ task, onFocus, onArchive }) => {
  const daysLeft = daysUntilFromDate(task.deadline)

  const deadlineColour =
    daysLeft === null ? '' :
    daysLeft < 0      ? 'text-red-500'    :
    daysLeft <= 3     ? 'text-red-500'    :
    daysLeft <= 7     ? 'text-amber-500'  :
    'text-masss-heading/40'

  const isActionable = task.status !== 'completed' && task.status !== 'archived'

  // Status icon
  const StatusIcon =
    task.status === 'completed'   ? CheckCircle :
    task.status === 'in_progress' ? Timer       :
    Circle

  const statusIconColour =
    task.status === 'completed'   ? 'text-masss-accent'   :
    task.status === 'in_progress' ? 'text-masss-accent'   :
    'text-masss-heading/30'

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-masss-bg transition-colors group">
      {/* Status icon */}
      <StatusIcon size={15} className={`shrink-0 ${statusIconColour}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium truncate ${
            task.status === 'completed'
              ? 'text-masss-heading/40 line-through'
              : 'text-masss-heading'
          }`}>
            {task.name}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            priorityClasses[task.priority] || priorityClasses.medium
          }`}>
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-masss-heading/40 flex items-center gap-1">
            <Timer size={10} />
            {task.sessionsCount || 0}/{task.estimatedPomodoros || 0} pomos
          </span>
          {task.deadline && (
            <span className={`text-xs flex items-center gap-1 ${deadlineColour}`}>
              <Clock size={10} />
              {deadlineLabel(task.deadline)}
            </span>
          )}
        </div>
      </div>

      {/* Focus button — only on actionable tasks */}
      {isActionable && (
        <button
          onClick={() => onFocus(task._id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-masss-accent/10 text-masss-accent hover:bg-masss-accent hover:text-white transition-all"
          title="Start focus session"
        >
          <Play size={13} fill="currentColor" />
        </button>
      )}

      {/* Archive button */}
      {isActionable && (
        <button
          onClick={() => onArchive(task._id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-masss-heading/30 hover:text-red-500 transition-all"
          title="Archive task"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )
}

// ── Create Exam Modal ─────────────────────────────────────────────────────────

const EMPTY_EXAM = { name: '', exam_type: 'quiz', due_date: '', weight: 10 }

const CreateExamModal = ({ open, onClose, onSubmit, submitting }) => {
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

// ── Create Task Modal ─────────────────────────────────────────────────────────

const EMPTY_TASK = {
  name:                '',
  description:         '',
  priority:            'medium',
  difficulty:          3,
  estimated_pomodoros: 2,
  deadline:            '',
  exam_id:             '',
}

const CreateTaskModal = ({ open, onClose, onSubmit, submitting, exams }) => {
  const [form, setForm] = useState(EMPTY_TASK)

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(form)
    setForm(EMPTY_TASK)
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
        className="bg-masss-white rounded-2xl p-6 w-full max-w-md border border-masss-mint shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-masss-heading">Add Task</h2>
            <p className="text-xs text-masss-heading/50 mt-0.5">Add a task to this module.</p>
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
              placeholder="What needs to be done?"
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

            {/* Difficulty — range slider */}
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

            {/* Pomodoros — ± counter */}
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

            {/* Deadline — datetime-local */}
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

          {/* Link to exam — only shown if module has exams */}
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
              className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Adding…' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Module Detail Page ────────────────────────────────────────────────────────

export default function ModuleDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { module, loading: mLoading, error: mError, refetch: mRefetch } = useModule(id)
  const { tasks,  loading: tLoading, createTask, archiveTask }          = useTasks({ moduleId: id })

  const [activeTab,      setActiveTab]      = useState('tasks')
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createExamOpen, setCreateExamOpen] = useState(false)
  const [submitting,     setSubmitting]     = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateTask = async (form) => {
    try {
      setSubmitting(true)
      await createTask({
        name:                form.name,
        description:         form.description  || undefined,
        module_id:           id,
        priority:            form.priority,
        difficulty:          form.difficulty,
        estimated_pomodoros: form.estimated_pomodoros,
        deadline:            form.deadline
          ? new Date(form.deadline).toISOString()
          : undefined,
        exam_id: form.exam_id || undefined,
      })
      setCreateTaskOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateExam = async (form) => {
    try {
      setSubmitting(true)
      await massApi.post(`/exams/module/${id}`, {
        name:      form.name,
        exam_type: form.exam_type,
        due_date:  form.due_date,
        weight:    form.weight,
      })
      await mRefetch()   // reload module so exams list updates
      setCreateExamOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading / error states ────────────────────────────────────────────────

  if (mLoading || tLoading) return <PageLoader />
  if (mError) return <PageError message={mError} onRetry={mRefetch} />
  if (!module) return <PageError message="Module not found" />

  const color = module.color || '#0FA89E'
  const exams = module.exams || []

  const tabs = [
    { id: 'tasks', label: 'Tasks', count: tasks?.length || 0 },
    { id: 'exams', label: 'Exams', count: exams.length },
  ]

  // Task buckets for stats
  const taskList     = tasks || []
  const inProgress   = taskList.filter(t => t.status === 'in_progress').length
  const completed    = taskList.filter(t => t.status === 'completed').length

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 m-6">
        <button
          onClick={() => navigate('/masss/modules')}
          className="p-2 rounded-lg border border-masss-mint text-masss-heading/60 hover:bg-masss-bg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Module identity */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '20', border: `1px solid ${color}35` }}
        >
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-masss-heading truncate">{module.name}</h1>
          <p className="text-xs text-masss-heading/50 capitalize">
            {module.category?.replace('_', ' ')} · Best in {module.energyTime || module.energy_time}
          </p>
        </div>

        {/* Add Task button — only on tasks tab */}
        {activeTab === 'tasks' && (
          <button
            onClick={() => setCreateTaskOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus size={14} />
            Add Task
          </button>
        )}

        {/* Add Exam button — only on exams tab */}
        {activeTab === 'exams' && (
          <button
            onClick={() => setCreateExamOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus size={14} />
            Add Exam
          </button>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-masss-bg border border-masss-mint rounded-xl m-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-masss-accent text-white shadow-sm'
                : 'text-masss-heading/50 hover:text-masss-heading',
            ].join(' ')}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-[10px] opacity-70">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Tasks tab ──────────────────────────────────────────────────── */}
        {activeTab === 'tasks' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-5 m-6"
          >
            {!taskList.length ? (
              <div className="p-8 text-center bg-masss-white border border-masss-mint rounded-2xl">
                <CheckCircle size={22} className="mx-auto mb-3 text-masss-heading/20" />
                <p className="text-sm font-medium text-masss-heading/40 mb-1">No tasks yet</p>
                <p className="text-xs text-masss-heading/30 mb-4">
                  Add your first task for this module.
                </p>
                <button
                  onClick={() => setCreateTaskOpen(true)}
                  className="px-4 py-2 bg-masss-accent text-white text-sm rounded-lg hover:opacity-90"
                >
                  Add Task
                </button>
              </div>
            ) : (
              <div className="bg-masss-white border border-masss-mint rounded-2xl overflow-hidden divide-y divide-masss-mint">
                {taskList.map((task, i) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TaskRow
                      task={task}
                      onFocus={(taskId) => navigate(`/masss/focus/${taskId}`)}
                      onArchive={(taskId) => archiveTask(taskId)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Stats strip — only when there are tasks */}
            {taskList.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Tasks', value: taskList.length,  color: 'text-masss-heading' },
                  { label: 'In Progress', value: inProgress,       color: 'text-masss-accent'  },
                  { label: 'Completed',   value: completed,         color: 'text-masss-accent'  },
                ].map(stat => (
                  <div key={stat.label} className="bg-masss-white border border-masss-mint rounded-2xl p-4 text-center">
                    <p className={`font-bold text-2xl tabular-nums ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-masss-heading/40 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Exams tab ──────────────────────────────────────────────────── */}
        {activeTab === 'exams' && (
          <motion.div
            key="exams"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {exams.length === 0 ? (
              <div className="p-8 text-center bg-masss-white border border-masss-mint rounded-2xl m-6">
                <Calendar size={22} className="mx-auto mb-3 text-masss-heading/20" />
                <p className="text-sm font-medium text-masss-heading/40 mb-1">No exams scheduled</p>
                <p className="text-xs text-masss-heading/30 mb-4">
                  Add an exam using the button above.
                </p>
                <button
                  onClick={() => setCreateExamOpen(true)}
                  className="px-4 py-2 bg-masss-accent text-white text-sm rounded-lg hover:opacity-90"
                >
                  Add Exam
                </button>
              </div>
            ) : (
              <div className="bg-masss-white border border-masss-mint rounded-2xl overflow-hidden divide-y divide-masss-mint m-6">
                {exams.map(ex => (
                  <ExamCard key={ex._id} exam={ex} />
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Create Task Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {createTaskOpen && (
          <CreateTaskModal
            open={createTaskOpen}
            onClose={() => setCreateTaskOpen(false)}
            onSubmit={handleCreateTask}
            submitting={submitting}
            exams={exams}
          />
        )}
      </AnimatePresence>

      {/* ── Create Exam Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {createExamOpen && (
          <CreateExamModal
            open={createExamOpen}
            onClose={() => setCreateExamOpen(false)}
            onSubmit={handleCreateExam}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

    </PageWrapper>
  )
}