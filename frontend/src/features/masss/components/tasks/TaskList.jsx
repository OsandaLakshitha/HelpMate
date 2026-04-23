// src/features/masss/components/tasks/TaskList.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, CheckSquare } from 'lucide-react'
import { TaskRow } from './TaskRow'

// ── TaskList ──────────────────────────────────────────────────────────────────
// variant="module" → divided list inside a single card (ModuleDetailPage)
// variant="page"   → space-y-2 of standalone cards (TasksPage)

export const TaskList = ({
  tasks,
  variant     = 'module',

  // Callbacks
  onFocus,
  onArchive,      // module variant
  onComplete,     // page variant
  getModuleName,  // page variant — fn(moduleId) → string | null

  // Empty state
  onAddClick,     // optional — shows Add Task button in empty state (module variant)
  emptyTitle    = 'No tasks yet',
  emptySubtitle = 'Add your first task for this module.',
}) => {

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!tasks || tasks.length === 0) {
    if (variant === 'page') {
      // TasksPage uses its own EmptyState component — return null and let the
      // page render it. TasksPage already conditionally renders EmptyState before
      // calling TaskList, so this branch is a safe fallback.
      return null
    }

    return (
      <div className="p-8 text-center bg-masss-white border border-masss-mint rounded-2xl">
        <CheckCircle size={22} className="mx-auto mb-3 text-masss-heading/20" />
        <p className="text-sm font-medium text-masss-heading/40 mb-1">{emptyTitle}</p>
        <p className="text-xs text-masss-heading/30 mb-4">{emptySubtitle}</p>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-masss-accent text-white text-sm rounded-lg hover:opacity-90"
          >
            Add Task
          </button>
        )}
      </div>
    )
  }

  // ── Module variant: rows inside a single divided card ───────────────────────
  if (variant === 'module') {
    return (
      <div className="bg-masss-white border border-masss-mint rounded-2xl overflow-hidden divide-y divide-masss-mint">
        {tasks.map((task, i) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <TaskRow
              task={task}
              variant="module"
              onFocus={onFocus}
              onArchive={onArchive}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  // ── Page variant: each task is its own card ─────────────────────────────────
  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <motion.div
          key={task._id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <TaskRow
            task={task}
            variant="page"
            onFocus={onFocus}
            onComplete={onComplete}
            moduleName={getModuleName ? getModuleName(task.moduleId) : null}
          />
        </motion.div>
      ))}
    </div>
  )
}