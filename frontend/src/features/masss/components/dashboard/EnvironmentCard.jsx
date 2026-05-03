// frontend/src/features/masss/components/dashboard/EnvironmentCard.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, ArrowUpRight } from 'lucide-react'
import { slotDefaultLabel, fatigueLabel } from '../../utils/slotUtils'

const SLOTS = ['morning', 'afternoon', 'evening']

const intensityBand = (v) => {
  if (v > 0.8) return { label: 'Crunch',     colour: '#EF4444' }
  if (v > 0.5) return { label: 'Moderate',   colour: '#F59E0B' }
  return               { label: 'Light',      colour: '#0FA89E' }
}

export default function EnvironmentCard({ stateVector, onNavigate }) {
  const fatigue   = stateVector?.cognitive_fatigue  ?? 0
  const intensity = stateVector?.workload_intensity ?? 0
  const energy    = stateVector?.energy_battery     ?? {}
  const slotFat   = stateVector?.slot_fatigue       ?? {}
  const labels    = stateVector?.slot_labels        ?? {}

  const fatInfo   = fatigueLabel(fatigue)
  const intBand   = intensityBand(intensity)
  const CIRC      = 2 * Math.PI * 28

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      onClick={() => onNavigate('/masss/ai-insights')}
      className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer hover:border-masss-accent/40 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-masss-accent" />
          <p className="text-xs font-bold text-masss-heading/50 uppercase tracking-wider">AI Signals</p>
        </div>
        <ArrowUpRight size={14} className="text-masss-heading/30" />
      </div>

      {/* Fatigue gauge + intensity */}
      <div className="flex items-center gap-4 mb-4">
        {/* Mini gauge */}
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="28" fill="none" stroke="#C7F0EB" strokeWidth="12" />
            <motion.circle
              cx="50" cy="50" r="28" fill="none"
              stroke={fatInfo.colour} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: CIRC * (1 - fatigue) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold text-masss-heading">{Math.round(fatigue * 100)}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: fatInfo.colour + '18', color: fatInfo.colour }}
            >
              {fatInfo.label}
            </span>
          </div>
          <p className="text-[10px] text-masss-heading/50 leading-relaxed">
            {fatigue < 0.4 ? 'You\'re fresh — hard tasks scheduled first.' :
             fatigue < 0.7 ? 'Some fatigue — AI mixing easier tasks in.' :
                             'High load — AI avoiding difficult tasks.'}
          </p>
        </div>
      </div>

      {/* Workload intensity bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-masss-heading/50">Workload pressure</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: intBand.colour + '18', color: intBand.colour }}
          >
            {intBand.label} · {Math.round(intensity * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${intensity * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: intBand.colour }}
          />
        </div>
      </div>

      {/* Slot energy mini bars */}
      <div className="space-y-1.5">
        {SLOTS.map(slot => {
          const slotEnergy = energy[slot]
          const score      = slotEnergy?.score ?? slotEnergy ?? 0
          const fatVal     = slotFat[slot] ?? null
          const label      = labels[slot] || slotDefaultLabel(slot)
          const eCol       = score >= 4 ? '#0FA89E' : score >= 2.5 ? '#F59E0B' : '#EF4444'

          return (
            <div key={slot} className="flex items-center gap-2">
              <p className="text-[10px] text-masss-heading/50 w-16 truncate">{label}</p>
              <div className="flex-1 h-1 bg-masss-mint rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / 5) * 100}%` }}
                  transition={{ duration: 0.7 }}
                  className="h-full rounded-full"
                  style={{ background: eCol }}
                />
              </div>
              <span className="text-[10px] font-semibold shrink-0" style={{ color: eCol }}>
                {score.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}