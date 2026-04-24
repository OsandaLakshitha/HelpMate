// src/features/masss/components/tasks/taskConstants.js

export const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'High'   },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low'    },
]

// Used in ModuleDetailPage TaskRow (inline badge inside divided list)
export const PRIORITY_CLASSES = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low:    'bg-masss-mint text-masss-accent',
}

// Used in TasksPage TaskRow (standalone card — same colours)
export const PRIORITY_BADGE = PRIORITY_CLASSES

export const EMPTY_TASK = {
  name:                '',
  description:         '',
  priority:            'medium',
  difficulty:          3,
  estimated_pomodoros: 2,
  deadline:            '',
  exam_id:             '',
  module_id:           '',
}

export const daysUntilFromDate = (dateStr) =>
  dateStr
    ? Math.floor((new Date(dateStr) - Date.now()) / 86_400_000)
    : null