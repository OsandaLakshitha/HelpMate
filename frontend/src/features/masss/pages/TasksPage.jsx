// frontend/src/features/masss/pages/TasksPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, Play, Filter } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useTasks }   from '../hooks/useTasks'
import { useModules } from '../hooks/useModules'
import { deadlineLabel } from '../utils/formatters'

const STATUS_TABS = [
  { id: '',            label: 'All'         },
  { id: 'pending',     label: 'Pending'     },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Completed'   },
]

const PRIORITY_BADGE = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low:    'bg-masss-mint text-masss-accent',
}

export default function TasksPage() {
  const navigate                   = useNavigate()
  const [statusFilter, setStatus]  = useState('')
  const [priorityFilter, setPriority] = useState('')

  const { tasks, loading, error, updateTask, archiveTask, refetch } = useTasks({
    status:   statusFilter   || undefined,
    priority: priorityFilter || undefined,
  })
  const { modules } = useModules()

  const getModuleName = (moduleId) => {
    if (!moduleId) return null
    const mod = modules.find(m => m._id === (moduleId._id || moduleId))
    return mod?.name
  }

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <PageWrapper>
      <PageHeader title="Tasks" subtitle="All tasks across modules" />

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
          {['high','medium','low'].map(p => (
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

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} />}
          title="No tasks found"
          subtitle="Try a different filter or add tasks from a module"
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 bg-masss-white border border-masss-mint rounded-xl group hover:border-masss-accent transition-colors"
            >
              {/* Status indicator */}
              <div className={[
                'w-2.5 h-2.5 rounded-full shrink-0',
                task.status === 'completed'  ? 'bg-masss-accent'   :
                task.status === 'in_progress' ? 'bg-amber-400 animate-pulse' :
                'bg-masss-mint border border-masss-accent',
              ].join(' ')} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-medium truncate ${
                    task.status === 'completed' ? 'text-masss-heading/40 line-through' : 'text-masss-heading'
                  }`}>
                    {task.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRIORITY_BADGE[task.priority] || ''}`}>
                    {task.priority}
                  </span>
                  {getModuleName(task.moduleId) && (
                    <span className="text-xs text-masss-heading/40">{getModuleName(task.moduleId)}</span>
                  )}
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

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status !== 'completed' && (
                  <button
                    onClick={() => navigate(`/masss/focus/${task._id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-masss-accent text-white rounded-lg text-xs font-medium hover:opacity-90"
                  >
                    <Play size={12} />
                    Focus
                  </button>
                )}
                {task.status === 'pending' && (
                  <button
                    onClick={() => updateTask(task._id, { status: 'completed' })}
                    className="px-3 py-1.5 bg-masss-bg border border-masss-mint text-masss-heading/60 rounded-lg text-xs hover:bg-masss-mint transition-colors"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}