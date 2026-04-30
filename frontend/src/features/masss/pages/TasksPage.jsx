// src/features/masss/pages/TasksPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useTasks }   from '../hooks/useTasks'
import { useModules } from '../hooks/useModules'
import { useMasss }   from '../context/MasssContext'
import { TaskList }        from '../components/tasks/TaskList'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'
import { EditTaskModal }   from '../components/tasks/EditTaskModal'

const STATUS_OPTIONS = [
  { value: '',            label: 'All statuses' },
  { value: 'pending',     label: 'Pending'      },
  { value: 'in_progress', label: 'In Progress'  },
  { value: 'completed',   label: 'Completed'    },
]

const PRIORITY_OPTIONS = [
  { value: '',       label: 'All priorities' },
  { value: 'high',   label: 'High'           },
  { value: 'medium', label: 'Medium'         },
  { value: 'low',    label: 'Low'            },
]

export default function TasksPage() {
  const navigate = useNavigate()

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search,         setSearch]       = useState('')
  const [statusFilter,   setStatus]       = useState('')
  const [priorityFilter, setPriority]     = useState('')
  const [moduleFilter,   setModuleFilter] = useState('')
  const [showFilters,    setShowFilters]  = useState(false)

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [createOpen,   setCreateOpen]   = useState(false)
  const [editingTask,  setEditingTask]  = useState(null)  // holds the task being edited
  const [submitting,   setSubmitting]   = useState(false)

  // ── Data ────────────────────────────────────────────────────────────────────
  const { tasks, loading, error, updateTask, archiveTask, createTask, refetch } = useTasks({
    status:    statusFilter   || undefined,
    priority:  priorityFilter || undefined,
    module_id: moduleFilter   || undefined,
    include_archived: true, 
  })
  const { modules } = useModules()
  const { focusActive, focusSessionId, focusTaskId } = useMasss()

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getModuleName = (moduleId) => {
    if (!moduleId) return null
    const mod = modules.find(m => m._id === (moduleId._id || moduleId))
    return mod?.name || null
  }

  // Client-side search on top of server-side filters
  const filtered = (tasks || []).filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeFilterCount = [statusFilter, priorityFilter, moduleFilter].filter(Boolean).length

  const clearFilters = () => {
    setStatus('')
    setPriority('')
    setModuleFilter('')
  }

  const moduleOptions = [
    { value: '', label: 'All modules' },
    ...(modules || []).map(m => ({ value: m._id, label: m.name })),
  ]

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFocusClick = (taskId) => {
    if (focusActive && focusSessionId && focusTaskId !== taskId) {
      navigate(`/masss/focus/${focusTaskId}`, {
        state: { conflictRedirect: true, attemptedTaskId: taskId },
      })
      return
    }
    navigate(`/masss/focus/${taskId}`)
  }

  const handleCreateTask = async (form) => {
    try {
      setSubmitting(true)
      await createTask({
        name:                form.name,
        description:         form.description || undefined,
        module_id:           form.module_id   || undefined,
        priority:            form.priority,
        difficulty:          form.difficulty,
        estimated_pomodoros: form.estimated_pomodoros,
        deadline:            form.deadline ? new Date(form.deadline).toISOString() : undefined,
      })
      setCreateOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Called by EditTaskModal on form submit
  const handleEditTask = async (taskId, payload) => {
    try {
      setSubmitting(true)
      await updateTask(taskId, payload)
      setEditingTask(null)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  const activeTasks = filtered.filter(t => t.status !== 'archived')

  return (
    <PageWrapper className="flex flex-col overflow-hidden pb-1">
      <PageHeader
        // title="Tasks"
        subtitle={
          activeTasks.length > 0
            ? `${activeTasks.length} task${activeTasks.length !== 1 ? 's' : ''}`
            : 'All tasks'
        }
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            New Task
          </button>
        }
      />

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-masss-heading/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-lg border border-masss-mint bg-masss-white text-sm text-masss-heading placeholder:text-masss-heading/30 focus:outline-none focus:border-masss-accent w-52 transition-colors"
          />
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={[
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
            showFilters
              ? 'bg-masss-accent text-white border-masss-accent'
              : 'bg-masss-white border-masss-mint text-masss-heading/60 hover:text-masss-heading',
          ].join(' ')}
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-masss-accent text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-masss-heading/50 hover:text-masss-heading transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}

        {/* Filter dropdowns */}
        {showFilters && (
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-masss-mint bg-masss-white text-sm text-masss-heading focus:outline-none focus:border-masss-accent"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={e => setPriority(e.target.value)}
              className="px-3 py-2 rounded-lg border border-masss-mint bg-masss-white text-sm text-masss-heading focus:outline-none focus:border-masss-accent"
            >
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-masss-mint bg-masss-white text-sm text-masss-heading focus:outline-none focus:border-masss-accent"
            >
              {moduleOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Task list ──────────────────────────────────────────────────────── */}
    
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} />}
          title={tasks?.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
          subtitle={
            tasks?.length === 0
              ? 'Add tasks inside a module to see them here.'
              : 'Try adjusting or clearing your filters.'
          }
        />
        
      ) : (
        <TaskList
          tasks={filtered}
          onFocus={handleFocusClick}
          onComplete={(taskId, payload) => updateTask(taskId, payload)}
          onArchive={archiveTask}
          onEdit={setEditingTask}
          getModuleName={getModuleName}
        />
      )}
      

      {/* Create modal */}
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTask}
        submitting={submitting}
        modules={modules}
      />

      {/* Edit modal */}
      <EditTaskModal
        open={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEditTask}
        submitting={submitting}
      />
    </PageWrapper>
  )
}

