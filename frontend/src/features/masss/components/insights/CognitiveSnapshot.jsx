// frontend/src/features/masss/components/insights/CognitiveSnapshot.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Layers, ArrowRight } from 'lucide-react'
import { SectionHeader } from './insightsAtoms'
import { slotDefaultLabel } from '../../utils/slotUtils'

const SLOTS = ['morning', 'afternoon', 'evening']

const CardLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-5">
    <Icon size={14} className="text-masss-accent" />
    <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider">
      {children}
    </p>
  </div>
)

const intensityBand = (v) => {
  if (v > 0.8) return {
    label: 'Crunch Mode',
    colour: '#EF4444',
    hint: 'Deadlines are imminent. The AI is prioritising your most urgent tasks and applying a 1.5× urgency multiplier to completion rewards.',
  }
  if (v > 0.5) return {
    label: 'Moderate',
    colour: '#F59E0B',
    hint: 'A reasonable amount on your plate. Keep steady and stick to the schedule.',
  }
  return {
    label: 'Manageable',
    colour: '#0FA89E',
    hint: 'Workload is under control. A good time to tackle harder conceptual tasks.',
  }
}

const energyBarWidth = (score) => `${Math.max(0, ((score - 1) / 4) * 100)}%`

const energyColour = (score) => {
  if (score >= 4) return '#0FA89E'
  if (score >= 2.5) return '#F59E0B'
  return '#EF4444'
}

const slotFatigueHint = (f) => {
  if (f == null) return 'No data yet for this slot.'
  if (f > 0.7) return 'This slot is burnt out. Avoid scheduling new sessions here.'
  if (f > 0.4) return 'Some fatigue in this slot. Lighter tasks work better here.'
  return 'This slot is fresh. Good time for focused study.'
}

const fatigueAIAction = (fatigue) => {
  if (fatigue > 0.7) return 'AI is avoiding difficulty ≥ 4 tasks. Fatigue-ignore penalty active (−2.0 reward).'
  if (fatigue > 0.4) return 'AI is mixing in easier tasks to protect your focus reserves.'
  return 'AI is free to assign your hardest tasks. No fatigue penalty applied.'
}

const fatigueLabel = (fatigue) => {
  if (fatigue > 0.7) return { label: 'Burnt out', colour: '#EF4444' }
  if (fatigue > 0.4) return { label: 'Tiring', colour: '#F59E0B' }
  return { label: 'Fresh', colour: '#0FA89E' }
}

export default function CognitiveSnapshot({ stateVector, activeSlot }) {
  const fatigue   = stateVector?.cognitive_fatigue  ?? 0
  const intensity = stateVector?.workload_intensity ?? 0
  const energy    = stateVector?.energy_battery     ?? {}
  const slotFat   = stateVector?.slot_fatigue       ?? {}
  const labels    = stateVector?.slot_labels        ?? {}

  const deadlineUrgency = stateVector?.deadline_urgency ?? null
  const workloadDensity = stateVector?.workload_density ?? null
  const difficultyMix   = stateVector?.difficulty_mix   ?? null

  const fatInfo  = fatigueLabel(fatigue)
  const intBand  = intensityBand(intensity)

  const CIRCUMFERENCE = 2 * Math.PI * 38

  return (
    <section className="mb-8">
      <SectionHeader
        number="1"
        title="Your cognitive snapshot"
        subtitle="Energy and fatigue across your three study slots right now"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Card 1: Cognitive Fatigue ─────────────────────────────────── */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-5">
          <CardLabel icon={Brain}>Cognitive Fatigue</CardLabel>

          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#C7F0EB" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="38" fill="none"
                  stroke={fatInfo.colour} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  initial={{ strokeDashoffset: CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - fatigue) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-masss-heading">
                  {Math.round(fatigue * 100)}%
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: fatInfo.colour + '18', color: fatInfo.colour }}
              >
                {fatInfo.label}
              </span>
              <p className="text-xs text-masss-heading/60 leading-relaxed mb-3">
                {fatigue < 0.4
                  ? "You're well-rested. The AI will assign your hardest tasks now while your focus is at its peak."
                  : fatigue < 0.7
                    ? 'Some fatigue detected. The AI is mixing easier tasks in to protect your focus reserves.'
                    : 'High cognitive load. The AI is avoiding heavy tasks and favouring shorter, manageable sessions.'}
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Fresh',  colour: '#0FA89E' },
                  { label: 'Tiring', colour: '#F59E0B' },
                  { label: 'Burnt',  colour: '#EF4444' },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.colour }} />
                    <span className="text-[10px] text-masss-heading/40">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="p-3 bg-masss-bg rounded-xl border border-masss-mint">
              <p className="text-[10px] font-semibold text-masss-heading/40 uppercase tracking-wide mb-1">
                How the AI calculates this
              </p>
              <p className="text-[10px] text-masss-heading/50 leading-relaxed">
                Calculated from your last 5 focus ratings, with more weight given to recent sessions.
                A poor session today impacts your score far more than one from two days ago.
              </p>
            </div>

            <div className="p-3 bg-masss-bg rounded-xl border border-masss-mint flex items-start gap-2">
              <ArrowRight size={10} className="text-masss-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-masss-heading/40 uppercase tracking-wide mb-1">
                  AI action right now
                </p>
                <p className="text-[10px] text-masss-heading/50 leading-relaxed">
                  {fatigueAIAction(fatigue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: Workload Intensity ────────────────────────────────── */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-5">
          <CardLabel icon={Zap}>Workload Intensity</CardLabel>

          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-bold text-masss-heading">
              {Math.round(intensity * 100)}
              <span className="text-xl text-masss-heading/40">%</span>
            </span>
            <span
              className="mb-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: intBand.colour + '18', color: intBand.colour }}
            >
              {intBand.label}
            </span>
          </div>

          <div className="h-2 bg-masss-mint rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${intensity * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: intBand.colour }}
            />
          </div>

          <p className="text-xs text-masss-heading/60 leading-relaxed mb-4">{intBand.hint}</p>

          <div className="p-3 bg-masss-bg rounded-xl border border-masss-mint space-y-3">
            <p className="text-[10px] font-semibold text-masss-heading/40 uppercase tracking-wide">
              What drives this score
            </p>
            {[
              { label: 'Deadline urgency',  weight: '40%', desc: 'How close your deadlines are',              value: deadlineUrgency },
              { label: 'Workload density',  weight: '40%', desc: 'How much study time you still have ahead',  value: workloadDensity },
              { label: 'Difficulty mix',    weight: '20%', desc: 'The overall complexity of your pending tasks', value: difficultyMix },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-[10px] font-medium text-masss-heading">{row.label}</p>
                    <p className="text-[10px] text-masss-heading/40">{row.desc}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    {row.value != null ? (
                      <p className="text-[10px] font-bold text-masss-accent">
                        {Math.round(row.value * 100)}%
                        <span className="text-masss-heading/30 font-normal ml-1">(×{row.weight})</span>
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-masss-accent">{row.weight}</p>
                    )}
                  </div>
                </div>
                {row.value != null && (
                  <div className="h-1 bg-masss-mint rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.value * 100}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: intBand.colour }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {intensity > 0.8 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
              <span className="text-red-500 text-xs">⚡</span>
              <p className="text-[10px] text-red-600 font-medium">
                Crunch mode active — the AI is applying a 1.5× urgency multiplier to completion rewards.
              </p>
            </div>
          )}
        </div>

        {/* ── Card 3: Slot Health ───────────────────────────────────────── */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-5 md:col-span-2">
          <CardLabel icon={Layers}>Slot Health — Energy &amp; Fatigue</CardLabel>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SLOTS.map((slot, i) => {
              const slotEnergy       = energy[slot]
              const score            = slotEnergy?.score ?? slotEnergy ?? 0
              const fatVal           = slotFat[slot] ?? null
              const label            = labels[slot] || slotDefaultLabel(slot)
              const eColour          = energyColour(score)
              const isCurrent        = slot === activeSlot
              const fatPct           = fatVal != null ? Math.round(fatVal * 100) : null
              const behaviouralScore = slotEnergy?.behavioural_score ?? null
              const contextScore     = slotEnergy?.context_energy    ?? null

              return (
                <motion.div
                  key={slot}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={[
                    'p-4 rounded-xl border transition-shadow',
                    isCurrent
                      ? 'border-masss-accent bg-masss-bg shadow-[0_0_0_2px_rgba(15,168,158,0.15)]'
                      : 'border-masss-mint bg-masss-bg',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-masss-accent animate-pulse shrink-0" />
                    )}
                    <p className="text-xs font-bold text-masss-heading capitalize">{label}</p>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-masss-accent/10 text-masss-accent font-semibold">
                        Now
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-masss-heading/50">Energy</span>
                      <span className="text-[10px] font-bold" style={{ color: eColour }}>
                        {score.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: energyBarWidth(score) }}
                        transition={{ duration: 0.8, delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ background: eColour }}
                      />
                    </div>
                  </div>

                  {(behaviouralScore != null || contextScore != null) && (
                    <div className="mb-3 flex gap-2">
                      {behaviouralScore != null && (
                        <div className="flex-1 p-1.5 rounded-lg bg-masss-white border border-masss-mint">
                          <p className="text-[9px] text-masss-heading/40 mb-0.5">Behavioural</p>
                          <p className="text-[10px] font-bold text-masss-heading">
                            {behaviouralScore.toFixed(1)}
                            <span className="text-masss-heading/30 font-normal">/5</span>
                          </p>
                          <p className="text-[9px] text-masss-heading/30">70% weight</p>
                        </div>
                      )}
                      {contextScore != null && (
                        <div className="flex-1 p-1.5 rounded-lg bg-masss-white border border-masss-mint">
                          <p className="text-[9px] text-masss-heading/40 mb-0.5">Contextual</p>
                          <p className="text-[10px] font-bold text-masss-heading">
                            {contextScore.toFixed(1)}
                            <span className="text-masss-heading/30 font-normal">/5</span>
                          </p>
                          <p className="text-[9px] text-masss-heading/30">30% weight</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-masss-heading/50">Slot fatigue</span>
                      <span className="text-[10px] font-bold text-masss-heading/60">
                        {fatPct != null ? `${fatPct}%` : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
                      {fatVal != null && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fatVal * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className="h-full rounded-full"
                          style={{
                            background: fatVal > 0.7 ? '#EF4444' : fatVal > 0.4 ? '#F59E0B' : '#0FA89E',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-masss-heading/50 leading-relaxed">
                    {slotFatigueHint(fatVal)}
                  </p>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-4 p-3 bg-masss-bg rounded-xl border border-masss-mint">
            <p className="text-[10px] font-semibold text-masss-heading/40 uppercase tracking-wide mb-1">
              How the AI uses this
            </p>
            <p className="text-[10px] text-masss-heading/50 leading-relaxed">
              Each slot's energy score reflects your actual study behavior during that time — how consistently
              you complete sessions, how long you stay focused, and how you rate your concentration. The AI
              assigns more demanding tasks to high energy slots and reduces workload in periods where fatigue
              is building.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}