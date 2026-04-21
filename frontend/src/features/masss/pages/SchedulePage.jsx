// frontend/src/features/masss/pages/SchedulePage.jsx

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Cpu, ListFilter } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader } from '../components/layout/PageWrapper'
import { useSchedule } from '../hooks/useSchedule'
import { useStateVector } from '../hooks/useStateVector'
import { getCurrentSlot, slotDefaultLabel } from '../utils/slotUtils'

const SLOTS = ['morning', 'afternoon', 'evening']

const PRIORITY_COLOURS = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low:    'bg-masss-mint text-masss-accent',
}

export default function SchedulePage() {
  const activeSlot = getCurrentSlot()
  const [view, setView] = useState('rl')

  const {
    rlSchedule, heuristicSchedule,
    rlLoading,  heuristicLoading,
    refetchRl,  refetchHeuristic,
  } = useSchedule(activeSlot)

  const { stateVector } = useStateVector(activeSlot)
  const slotLabels = stateVector?.slot_labels ?? {}

  const schedule = view === 'rl' ? rlSchedule : heuristicSchedule
  const loading  = view === 'rl' ? rlLoading  : heuristicLoading
  const refetch  = view === 'rl' ? refetchRl  : refetchHeuristic

  return (
    <PageWrapper>
      <PageHeader
        title="Schedule"
        subtitle="AI-powered daily plan"
        action={
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-masss-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      />

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 bg-masss-white border border-masss-mint rounded-xl w-fit mb-6">
        {[
          { id: 'rl',        label: 'AI Schedule', icon: Cpu       },
          { id: 'heuristic', label: 'Heuristic',   icon: ListFilter },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={[
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              view === v.id
                ? 'bg-masss-accent text-white'
                : 'text-masss-heading/60 hover:text-masss-heading',
            ].join(' ')}
          >
            <v.icon size={14} />
            {v.label}
          </button>
        ))}
      </div>

      {/* Strategy badge */}
      {schedule?.strategy_used && (
        <div className="flex items-center gap-2 mb-5">
          <span className="px-3 py-1 rounded-full bg-masss-mint text-masss-accent text-xs font-semibold">
            {schedule.strategy_used === 'rl_ppo' ? '✦ AI-generated' : schedule.strategy_used}
          </span>
          {schedule.work_intensity !== undefined && (
            <span className="text-xs text-masss-heading/50">
              Work intensity: {Math.round(schedule.work_intensity * 100)}%
            </span>
          )}
        </div>
      )}

      {loading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SLOTS.map(slot => {
            const tasks   = schedule?.[slot] ?? []
            const label   = slotLabels[slot] || slotDefaultLabel(slot)
            const isCurrent = slot === activeSlot

            return (
              <div
                key={slot}
                className={[
                  'bg-masss-white border rounded-2xl overflow-hidden',
                  isCurrent ? 'border-masss-accent' : 'border-masss-mint',
                ].join(' ')}
              >
                {/* Slot header */}
                <div className={[
                  'px-4 py-3 border-b flex items-center gap-2',
                  isCurrent ? 'bg-masss-bg border-masss-accent' : 'bg-masss-bg border-masss-mint',
                ].join(' ')}>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-masss-accent animate-pulse shrink-0" />
                  )}
                  <p className="font-semibold text-masss-heading text-sm">{label}</p>
                  <span className="ml-auto text-xs text-masss-heading/50">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-2 min-h-[120px]">
                  {tasks.length === 0 ? (
                    <div className="h-20 flex items-center justify-center">
                      <p className="text-xs text-masss-heading/30">No tasks scheduled</p>
                    </div>
                  ) : (
                    tasks.map((task, i) => (
                      <motion.div
                        key={task.task_id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 bg-masss-bg rounded-xl border border-masss-mint"
                      >
                        <p className="text-sm font-medium text-masss-heading truncate mb-1.5">
                          {task.task_name}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.priority && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              PRIORITY_COLOURS[task.priority] || 'bg-masss-mint text-masss-accent'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                          {task.allocation_type && (
                            <span className="px-2 py-0.5 rounded-full bg-masss-white border border-masss-mint text-[10px] text-masss-heading/50">
                              {task.allocation_type.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {schedule?.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {schedule.error}
        </div>
      )}
    </PageWrapper>
  )
}