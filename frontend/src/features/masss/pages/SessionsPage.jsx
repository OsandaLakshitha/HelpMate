// frontend/src/features/masss/pages/SessionsPage.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Star } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useSessions } from '../hooks/useSessions'
import { formatDuration, formatDate, ratingColour } from '../utils/formatters'

const END_TYPE_BADGE = {
  completed: 'bg-masss-mint text-masss-accent',
  stopped:   'bg-amber-100 text-amber-600',
  aborted:   'bg-red-100 text-red-400',
  skipped:   'bg-masss-bg text-masss-heading/50',
}

export default function SessionsPage() {
  const { sessions, loading, error, refetch } = useSessions()

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <PageWrapper>
      <PageHeader
        // title="Sessions"
        // subtitle="Your study history"
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={<Clock size={32} />}
          title="No sessions yet"
          subtitle="Start a Focus session to record your study time"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 bg-masss-white border border-masss-mint rounded-xl"
            >
              {/* Time indicator */}
              <div className="w-10 h-10 bg-masss-bg border border-masss-mint rounded-xl flex items-center justify-center shrink-0">
                <Clock size={16} className="text-masss-accent" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-masss-heading truncate">
  {session.taskId?.name || 'Session'}
</p>
<span className="text-[10px] text-masss-heading/40 shrink-0">
  Session {sessions
    .slice(0, i + 1)
    .filter(s => s.taskId?._id === session.taskId?._id).length}
  {session.taskId?.estimatedPomodoros
    ? ` of ${session.taskId.estimatedPomodoros}`
    : ''}
</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    END_TYPE_BADGE[session.endType] || ''
                  }`}>
                    {session.endType}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-masss-heading/50">
                  <span className="capitalize">{session.slotType} slot</span>
                  <span>{formatDuration(session.durationMinutes)}</span>
                  <span>{formatDate(session.startTime)}</span>
                </div>
              </div>

              {/* Rating */}
              {session.focusRating && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star
                    size={14}
                    className="fill-current"
                    style={{ color: ratingColour(session.focusRating) }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: ratingColour(session.focusRating) }}
                  >
                    {session.focusRating}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}