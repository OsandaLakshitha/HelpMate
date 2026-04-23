// src/features/masss/components/tasks/TaskRow.jsx

import React from 'react'
import {
  CheckCircle, Timer, Circle,
  Play, Trash2, Clock,
} from 'lucide-react'
import { deadlineLabel } from '../../utils/formatters'
import { PRIORITY_CLASSES, PRIORITY_BADGE, daysUntilFromDate } from './taskConstants'

// ── Module variant ────────────────────────────────────────────────────────────
// Used in ModuleDetailPage: rows inside a divided list card.
// Shows lucide status icon, focus + archive on hover.

const ModuleTaskRow = ({ task, onFocus, onArchive }) => {
  const daysLeft = daysUntilFromDate(task.deadline)

  const deadlineColour =
    daysLeft === null ? '' :
    daysLeft < 0      ? 'text-red-500'   :
    daysLeft <= 3     ? 'text-red-500'   :
    daysLeft <= 7     ? 'text-amber-500' :
    'text-masss-heading/40'

  const isActionable = task.status !== 'completed' && task.status !== 'archived'

  const StatusIcon =
    task.status === 'completed'   ? CheckCircle :
    task.status === 'in_progress' ? Timer       :
    Circle

  const statusIconColour =
    task.status === 'completed'   ? 'text-masss-accent'  :
    task.status === 'in_progress' ? 'text-masss-accent'  :
    'text-masss-heading/30'

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-masss-bg transition-colors group">
      <StatusIcon size={15} className={`shrink-0 ${statusIconColour}`} />

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
            PRIORITY_CLASSES[task.priority] || PRIORITY_CLASSES.medium
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

      {isActionable && (
        <button
          onClick={() => onFocus(task._id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-masss-accent/10 text-masss-accent hover:bg-masss-accent hover:text-white transition-all"
          title="Start focus session"
        >
          <Play size={13} fill="currentColor" />
        </button>
      )}

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

// ── Page variant ──────────────────────────────────────────────────────────────
// Used in TasksPage: each task is a standalone card with border + hover effect.
// Shows dot status indicator, module name, focus + done on hover.

const PageTaskRow = ({ task, onFocus, onComplete, moduleName }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-masss-white border border-masss-mint rounded-xl group hover:border-masss-accent transition-colors">
      {/* Status dot */}
      <div className={[
        'w-2.5 h-2.5 rounded-full shrink-0',
        task.status === 'completed'   ? 'bg-masss-accent'                          :
        task.status === 'in_progress' ? 'bg-amber-400 animate-pulse'              :
        'bg-masss-mint border border-masss-accent',
      ].join(' ')} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-sm font-medium truncate ${
            task.status === 'completed'
              ? 'text-masss-heading/40 line-through'
              : 'text-masss-heading'
          }`}>
            {task.name}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            PRIORITY_BADGE[task.priority] || ''
          }`}>
            {task.priority}
          </span>
          {moduleName && (
            <span className="text-xs text-masss-heading/40">{moduleName}</span>
          )}
          <span className="text-xs text-masss-heading/40">
            {task.sessionsCount || 0}/{task.estimatedPomodoros || 0} pomos
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
            onClick={() => onFocus(task._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-masss-accent/10 text-masss-accent rounded-lg text-xs font-medium hover:bg-masss-accent hover:text-white transition-colors"
          >
            <Play size={11} fill="currentColor" />
            Focus
          </button>
        )}
        {task.status === 'pending' && (
          <button
            onClick={() => onComplete(task._id, { status: 'completed' })}
            className="px-3 py-1.5 bg-masss-bg border border-masss-mint text-masss-heading/60 rounded-lg text-xs hover:bg-masss-mint transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}

// ── Exported TaskRow (switches variant) ───────────────────────────────────────

export const TaskRow = ({ task, variant = 'module', onFocus, onArchive, onComplete, moduleName }) => {
  if (variant === 'page') {
    return (
      <PageTaskRow
        task={task}
        onFocus={onFocus}
        onComplete={onComplete}
        moduleName={moduleName}
      />
    )
  }
  return (
    <ModuleTaskRow
      task={task}
      onFocus={onFocus}
      onArchive={onArchive}
    />
  )
}