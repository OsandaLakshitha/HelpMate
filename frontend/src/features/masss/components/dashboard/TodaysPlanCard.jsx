// frontend/src/features/masss/components/dashboard/TodaysPlanCard.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, ArrowUpRight, Cpu, ListFilter, Zap } from 'lucide-react'
import { slotDefaultLabel } from '../../utils/slotUtils'

const SLOTS = ['morning', 'afternoon', 'evening']

const strategyMeta = (strategy) => {
  if (strategy === 'rl_ppo')            return { label: 'AI Generated',     colour: '#0FA89E', Icon: Cpu       }
  if (strategy === 'priority_fallback') return { label: 'Priority Based',   colour: '#F59E0B', Icon: ListFilter }
  return                                       { label: 'Heuristic',        colour: '#94A3B8', Icon: ListFilter }
}

const priorityStyle = (p) =>
  p === 'high'   ? 'bg-red-50 text-red-500'     :
  p === 'medium' ? 'bg-amber-50 text-amber-500' :
                   'bg-masss-mint text-masss-accent'

export default function TodaysPlanCard({
  rlSchedule, rlLoading, activeSlot, slotLabels, preferences, onNavigate,
}) {
  const meta     = strategyMeta(rlSchedule?.strategy_used)
  const { Icon } = meta

  const bestPref = (preferences ?? []).reduce(
    (best, p) => (p.inferred_energy_score ?? 0) > (best?.inferred_energy_score ?? 0) ? p : best,
    (preferences ?? [])[0] || null
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onNavigate('/masss/schedule')}
      className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer hover:border-masss-accent/40 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-masss-accent" />
          <p className="text-xs font-bold text-masss-heading/50 uppercase tracking-wider">Today's Plan</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: meta.colour + '18', color: meta.colour }}
          >
            <Icon size={9} />
            {meta.label}
          </span>
          <ArrowUpRight size={13} className="text-masss-heading/20 group-hover:text-masss-accent transition-colors" />
        </div>
      </div>

      {/* Slot columns */}
      {rlLoading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-masss-mint border-t-masss-accent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {SLOTS.map(slot => {
            const tasks    = rlSchedule?.[slot] ?? []
            const label    = slotLabels[slot] || slotDefaultLabel(slot)
            const isActive = slot === activeSlot
            return (
              <div
                key={slot}
                className={[
                  'p-3 rounded-xl border',
                  isActive
                    ? 'border-masss-accent bg-masss-bg shadow-[0_0_0_1px_rgba(15,168,158,0.1)]'
                    : 'border-masss-mint bg-masss-bg/40',
                ].join(' ')}
              >
                <div className="flex items-center gap-1 mb-2">
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-masss-accent animate-pulse shrink-0" />
                  )}
                  <p className="text-[10px] font-bold text-masss-heading truncate flex-1">{label}</p>
                  <span className="text-[9px] text-masss-heading/30 shrink-0">{tasks.length}</span>
                </div>
                {tasks.length === 0 ? (
                  <p className="text-[9px] text-masss-heading/20">No tasks</p>
                ) : (
                  <div className="space-y-0.5">
                    {tasks.slice(0, 2).map((t, i) => (
                      <p key={i} className="text-[9px] text-masss-heading/50 truncate">· {t.task_name}</p>
                    ))}
                    {tasks.length > 2 && (
                      <p className="text-[9px] text-masss-accent font-medium">+{tasks.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Best slot callout */}
      {bestPref && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-masss-bg rounded-xl border border-masss-mint">
          <Zap size={11} className="text-masss-accent shrink-0" />
          <p className="text-[10px] text-masss-heading/60 leading-relaxed">
            Your best slot is{' '}
            <span className="font-semibold text-masss-heading">
              {bestPref.slot_label || slotDefaultLabel(bestPref.slot_name)}
            </span>
            {' '}— AI schedules hardest tasks there.
          </p>
        </div>
      )}
    </motion.div>
  )
}