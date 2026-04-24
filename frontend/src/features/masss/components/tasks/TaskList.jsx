// src/features/masss/components/tasks/TaskList.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { TaskRow } from './TaskRow'

export const TaskList = ({
  tasks,
  onFocus,
  onComplete,
  onArchive,
  getModuleName,  // optional — fn(moduleId) → string | null
  onAddClick,     // optional — shows Add Task button in empty state
  emptyTitle    = 'No tasks yet',
  emptySubtitle = 'Add your first task.',
}) => {

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!tasks || tasks.length === 0) {
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

  // ── Task list ────────────────────────────────────────────────────────────────
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
            onFocus={onFocus}
            onComplete={onComplete}
            onArchive={onArchive}
            moduleName={getModuleName ? getModuleName(task.moduleId) : null}
          />
        </motion.div>
      ))}
    </div>
  )
}