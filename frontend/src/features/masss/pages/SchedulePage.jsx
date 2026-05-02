// frontend/src/features/masss/pages/SchedulePage.jsx

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Cpu, ListFilter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TaskRow } from '../components/tasks/TaskRow'
import { useTasks } from '../hooks/useTasks'
import { PageWrapper, PageHeader, PageLoader } from '../components/layout/PageWrapper'
import { useSchedule } from '../hooks/useSchedule'
import { useStateVector } from '../hooks/useStateVector'
import { useProfile } from '../hooks/useProfile'
import { getCurrentSlot, slotDefaultLabel } from '../utils/slotUtils'

const SLOTS = ['morning', 'afternoon', 'evening']


export default function SchedulePage() {
  const navigate = useNavigate()
const { tasks: allTasks, updateTask } = useTasks()
  const activeSlot = getCurrentSlot()
  const [view, setView] = useState('rl')

  const {
    rlSchedule, heuristicSchedule,
    rlLoading,  heuristicLoading,
    refetchRl,  refetchHeuristic,
  } = useSchedule(activeSlot)

  const { stateVector } = useStateVector(activeSlot)
  const slotLabels = stateVector?.slot_labels ?? {}
const { preferences, routine } = useProfile()

  const schedule = view === 'rl' ? rlSchedule : heuristicSchedule
  const loading  = view === 'rl' ? rlLoading  : heuristicLoading
  const refetch  = view === 'rl' ? refetchRl  : refetchHeuristic

  // Get today's day name e.g. "monday"
const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

// Assign a routine event to a slot based on its start_time vs slot windows
const getRoutineSlot = (event) => {
  const [h] = (event.start_time || '0:0').split(':').map(Number)
  for (const pref of preferences) {
    if (!pref.start_time || !pref.end_time) continue
    const [sh] = pref.start_time.split(':').map(Number)
    const [eh] = pref.end_time.split(':').map(Number)
    if (h >= sh && h < eh) return pref.slot_name
  }
  // Fallback to legacy boundaries
  if (h >= 6  && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'evening'
}

const ACTIVITY_BADGE = {
  class:  'bg-masss-mint text-masss-accent',
  work:   'bg-amber-100 text-amber-600',
  habit:  'bg-purple-100 text-purple-600',
  sleep:  'bg-slate-100 text-slate-500',
}

const todayRoutine = routine.filter(e => e.day_of_week === todayName)

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
                  <div className="flex flex-col min-w-0">
                    <p className="font-semibold text-masss-heading text-sm">{label}</p>
                    {(() => {
                      const pref = preferences.find(p => p.slot_name === slot)
                      return pref?.start_time && pref?.end_time ? (
                        <p className="text-[15px] text-masss-heading/40 mt-0.5 font-mono font">
                          {pref.start_time} - {pref.end_time}
                        </p>
                      ) : null
                    })()}
                  </div>
                  <span className="ml-auto text-xs text-masss-heading/50 shrink-0">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-2 min-h-[120px]">
                    {todayRoutine
    .filter(e => getRoutineSlot(e) === slot)
    .map(e => (
      <div
        key={e.id}
        className="px-3 py-2 rounded-xl border border-dashed border-masss-mint bg-masss-bg flex items-center gap-2"
      >
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${ACTIVITY_BADGE[e.activity_type] || 'bg-masss-mint text-masss-accent'}`}>
          {e.activity_type}
        </span>
        <p className="text-xs font-medium text-masss-heading truncate flex-1">{e.name}</p>
        <span className="text-[10px] text-masss-heading/40 shrink-0">{e.start_time}–{e.end_time}</span>
      </div>
    ))
  }
                  {tasks.length === 0 ? (
                    <div className="h-20 flex items-center justify-center">
                      <p className="text-xs text-masss-heading/30">No tasks scheduled</p>
                    </div>
                  ) : tasks.map((scheduledTask) => {
  const fullTask = allTasks.find(t => t._id === scheduledTask.task_id)
  if (!fullTask) return null
  return (
    <TaskRow
      key={fullTask._id}
      task={fullTask}
      onFocus={(id) => navigate(`/masss/focus/${id}`)}
      onComplete={(id, payload) => updateTask(id, payload)}
      onArchive={() => {}}
      onEdit={() => {}}
       hideMenu
    />
  )
})}
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