// frontend/src/features/masss/components/insights/AIRecommendations.jsx

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sun, Sunset, Moon } from 'lucide-react'
import { SLOTS, taskReason } from './insightsUtils'
import { SectionHeader, Collapse } from './insightsAtoms'

const SLOT_ICONS = { morning: Sun, afternoon: Sunset, evening: Moon }

export default function AIRecommendations({ rlSchedule, rlLoading, allTasks, energy }) {
  const bestSlot = SLOTS.reduce((best, s) => {
    const sScore = energy[s]?.score ?? energy[s] ?? 0
    const bScore = energy[best]?.score ?? energy[best] ?? 0
    return sScore > bScore ? s : best
  }, 'morning')

  const rankedTasks = useMemo(() => {
    if (!rlSchedule) return []
    return SLOTS
      .flatMap(slot => (rlSchedule[slot] ?? []).map(t => ({ ...t, slot })))
      .map(st => {
        const full   = allTasks.find(t => t._id === st.task_id)
        const reason = taskReason(st, full, bestSlot)
        return { scheduled: st, full, reason }
      })
      .filter(r => r.full && r.reason)
  }, [rlSchedule, allTasks, bestSlot])

  return (
    <section className="mb-8">
      <SectionHeader
        number="2"
        title="Why the AI recommended this"
        subtitle="One reason per task based on urgency, momentum, or slot energy"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-masss-white border border-masss-mint rounded-2xl p-5"
      >
        {rlLoading ? (
          <p className="text-xs text-masss-heading/40 text-center py-6">Loading schedule…</p>
        ) : rankedTasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-masss-heading/40">No scheduled tasks yet today.</p>
            <p className="text-xs text-masss-heading/30 mt-1 mb-4">
              The AI needs to build your schedule first.
            </p>
            <a
              href="/masss/schedule"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-masss-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Schedule →
            </a>
          </div>
        ) : (
          <div className="divide-y divide-masss-mint">
            {rankedTasks.map(({ scheduled, full, reason }, i) => {
              const Icon = SLOT_ICONS[scheduled.slot]
              return (
                <motion.div
                  key={full._id}
                  initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.04 }}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  {/* Rank */}
                  <span className="w-5 h-5 rounded-full border border-masss-mint text-[10px] font-bold text-masss-heading/40 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>

                  {/* Task + reason */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-masss-heading truncate">{full.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span style={{ color: reason.colour }} className="text-xs">{reason.icon}</span>
                      <p className="text-xs text-masss-heading/50">{reason.text}</p>
                    </div>
                  </div>

                  {/* Slot */}
                  <div className="flex items-center gap-1 shrink-0">
                    {Icon && <Icon size={11} className="text-masss-heading/30" />}
                    <span className="text-[10px] text-masss-heading/40 capitalize">{scheduled.slot}</span>
                  </div>

                  {/* Priority */}
                  {full.priority && (
                    <span className={[
                      'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                      full.priority === 'high'   ? 'bg-red-50 text-red-500' :
                      full.priority === 'medium' ? 'bg-amber-50 text-amber-500' :
                                                   'bg-masss-mint text-masss-accent',
                    ].join(' ')}>
                      {full.priority}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        <Collapse label="How does the AI rank tasks?">
The AI prioritizes urgency (deadlines), momentum (ongoing work), energy (best time slots), and priority. In-progress tasks are kept first to maintain flow, while the rest are ordered by due time and task fit
        </Collapse>
      </motion.div>
    </section>
  )
}