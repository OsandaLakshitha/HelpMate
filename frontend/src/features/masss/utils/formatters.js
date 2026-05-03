// frontend/src/features/masss/utils/formatters.js

/**
 * Date and text formatting helpers used across MASSS pages.
 */

// Format a date as "Jan 15, 2025"
export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
}

// Format a date as "Jan 15"
export const formatShortDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  })
}

// Format duration in minutes as "24m" or "1h 12m"
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Days until a date — returns negative if overdue
export const daysUntil = (date) => {
  if (!date) return null
  const now   = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - now) / 86_400_000)
}

// Human-readable deadline label
export const deadlineLabel = (date) => {
  if (!date) return null
  const days = daysUntil(date)
  if (days < 0)  return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 7)  return `${days}d left`
  return formatShortDate(date)
}

// Capitalise first letter
export const capitalise = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Priority colour
export const priorityColour = (priority) => ({
  high:   '#F87171',
  medium: '#FBBF24',
  low:    '#34D399',
}[priority] || '#94A3B8')

// Status label
export const statusLabel = (status) => ({
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  archived:    'Archived',
}[status] || status)

// Focus rating to label
export const ratingLabel = (rating) => ({
  5: 'Excellent',
  4: 'Good',
  3: 'Average',
  2: 'Poor',
  1: 'Very Poor',
}[rating] || '—')

// Focus rating to colour
export const ratingColour = (rating) => {
  if (rating >= 4) return '#34D399'
  if (rating >= 3) return '#38BDF8'
  if (rating >= 2) return '#FBBF24'
  return '#F87171'
}