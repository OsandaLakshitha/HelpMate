// src/features/masss/pages/TasksPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Plus } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useTasks }   from '../hooks/useTasks'
import { useModules } from '../hooks/useModules'
import { useMasss }   from '../context/MasssContext'
import { TaskList }        from '../components/tasks/TaskList'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'

const STATUS_TABS = [
  { id: '',            label: 'All'         },
  { id: 'pending',     label: 'Pending'     },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Completed'   },
]

export default function TasksPage() {
  const navigate = useNavigate()

  const [statusFilter,   setStatus]   = useState('')
  const [priorityFilter, setPriority] = useState('')
  const [createOpen,     setCreateOpen] = useState(false)
  const [submitting,     setSubmitting] = useState(false)

  const { tasks, loading, error, updateTask, archiveTask, createTask, refetch } = useTasks({
    status:   statusFilter   || undefined,
    priority: priorityFilter || undefined,
  })
  const { modules } = useModules()

  const { focusActive, focusSessionId, focusTaskId } = useMasss()

  const getModuleName = (moduleId) => {
    if (!moduleId) return null
    const mod = modules.find(m => m._id === (moduleId._id || moduleId))
    return mod?.name || null
  }

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

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <PageWrapper>
 

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 bg-masss-white border border-masss-mint rounded-xl">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatus(tab.id)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                statusFilter === tab.id
                  ? 'bg-masss-accent text-white'
                  : 'text-masss-heading/60 hover:text-masss-heading',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1 p-1 bg-masss-white border border-masss-mint rounded-xl">
          <button
            onClick={() => setPriority('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !priorityFilter ? 'bg-masss-accent text-white' : 'text-masss-heading/60 hover:text-masss-heading'
            }`}
          >
            All
          </button>
          {['high', 'medium', 'low'].map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                priorityFilter === p ? 'bg-masss-accent text-white' : 'text-masss-heading/60 hover:text-masss-heading'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} />}
          title="No tasks found"
          subtitle="Try a different filter or add tasks from a module"
        />
      ) : (
        <TaskList
          tasks={tasks}
          variant="page"
          onFocus={handleFocusClick}
          onComplete={(taskId, payload) => updateTask(taskId, payload)}
          getModuleName={getModuleName}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTask}
        submitting={submitting}
      />
    </PageWrapper>
  )
}