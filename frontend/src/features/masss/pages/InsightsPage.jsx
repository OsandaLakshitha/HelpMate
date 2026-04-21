// frontend/src/features/masss/pages/InsightsPage.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Activity } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader } from '../components/layout/PageWrapper'
import { useStateVector } from '../hooks/useStateVector'
import { getCurrentSlot, slotDefaultLabel, fatigueLabel } from '../utils/slotUtils'
import { ratingColour } from '../utils/formatters'

export default function InsightsPage() {
  const activeSlot                           = getCurrentSlot()
  const { stateVector, loading, refetch }    = useStateVector(activeSlot)

  if (loading) return <PageLoader />

  const fatigue   = stateVector?.cognitive_fatigue    ?? 0
  const intensity = stateVector?.workload_intensity   ?? 0
  const history   = stateVector?.focus_history        ?? []
  const energy    = stateVector?.energy_battery       ?? {}
  const strengths = stateVector?.category_strengths   ?? {}
  const labels    = stateVector?.slot_labels          ?? {}
  const fatInfo   = fatigueLabel(fatigue)

  const CATEGORY_LABELS = {
    coding:          'Coding',
    math_logic:      'Math & Logic',
    language:        'Language',
    creative_design: 'Creative Design',
    memorization:    'Memorisation',
    other:           'Other',
  }

  return (
    <PageWrapper>
      <PageHeader
        title="AI Insights"
        subtitle="Cognitive analytics"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Cognitive Fatigue */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-5">
          <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-4">
            Cognitive Fatigue
          </p>
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#C7F0EB" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="38"
                  fill="none"
                  stroke={fatInfo.colour}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - fatigue) }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-masss-heading">{Math.round(fatigue * 100)}%</span>
              </div>
            </div>
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2"
                style={{ background: fatInfo.colour + '20', color: fatInfo.colour }}
              >
                {fatInfo.label}
              </span>
              <p className="text-xs text-masss-heading/50 leading-relaxed">
                {fatigue < 0.4
                  ? 'You are well-rested and ready for demanding tasks.'
                  : fatigue < 0.7
                  ? 'Signs of fatigue. Consider shorter sessions.'
                  : 'High cognitive load. Take a break before studying.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Workload Intensity */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-5">
          <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-4">
            Workload Intensity
          </p>
          <div className="flex items-center gap-3 mb-4">
            <Zap size={20} className="text-masss-accent" />
            <span className="text-3xl font-bold text-masss-heading">{Math.round(intensity * 100)}%</span>
          </div>
          <div className="h-2 bg-masss-mint rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${intensity * 100}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: intensity > 0.8 ? '#EF4444' : '#0FA89E' }}
            />
          </div>
          <p className="text-xs text-masss-heading/50">
            {intensity > 0.8
              ? 'Crunch mode — prioritise urgent tasks.'
              : intensity > 0.5
              ? 'Moderate workload.'
              : 'Manageable workload.'}
          </p>
        </div>

        {/* Slot Energy Battery */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-5">
          <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-4">
            Energy Battery
          </p>
          <div className="space-y-4">
            {['morning', 'afternoon', 'evening'].map(slot => {
              const data  = energy[slot] ?? { score: 0, label: '' }
              const label = labels[slot] || slotDefaultLabel(slot)
              const pct   = ((data.score || 0) / 5) * 100
              return (
                <div key={slot}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-masss-heading">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-masss-heading/50">{(data.score || 0).toFixed(1)}/5</span>
                      {data.label && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-masss-mint text-masss-accent font-medium">
                          {data.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-masss-mint rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full bg-masss-accent rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Focus History */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-5">
          <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-4">
            Focus History
          </p>
          {history.length === 0 ? (
            <div className="h-24 flex items-center justify-center">
              <p className="text-sm text-masss-heading/30">No session history yet</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-24">
              {history.map((r, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(r / 5) * 80}px` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full rounded-t"
                    style={{
                      background: ratingColour(r),
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[10px] text-masss-heading/40">{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Strengths */}
        {Object.keys(strengths).length > 0 && (
          <div className="bg-masss-white border border-masss-mint rounded-2xl p-5 md:col-span-2">
            <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-4">
              Category Strengths
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(strengths).map(([cat, score]) => (
                <div key={cat} className="p-3 bg-masss-bg rounded-xl border border-masss-mint">
                  <p className="text-xs font-semibold text-masss-heading mb-2">
                    {CATEGORY_LABELS[cat] || cat}
                  </p>
                  <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score * 100}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full bg-masss-accent rounded-full"
                    />
                  </div>
                  <p className="text-xs text-masss-accent font-medium mt-1">
                    {Math.round(score * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  )
}