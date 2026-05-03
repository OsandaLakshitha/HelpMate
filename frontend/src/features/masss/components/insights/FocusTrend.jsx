// frontend/src/features/masss/components/insights/FocusTrend.jsx

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { build28DayData } from './insightsUtils'
import { SectionHeader, Collapse } from './insightsAtoms'
import { slotDefaultLabel } from '../../utils/slotUtils'

const avg14 = (arr) =>
  arr.length ? arr.reduce((a, b) => a + b.avg, 0) / arr.length : null

export default function FocusTrend({ sessions, bestSlot, slotLabels }) {
  const chartData = useMemo(() => build28DayData(sessions), [sessions])

  const withData  = chartData.filter(d => d.avg !== null)
  const trendDiff = (avg14(chartData.slice(14).filter(d => d.avg !== null)) ?? 0)
                  - (avg14(chartData.slice(0, 14).filter(d => d.avg !== null)) ?? 0)
  const trendPct  = Math.abs(Math.round(trendDiff * 20))
  const bestLabel = slotLabels[bestSlot] || slotDefaultLabel(bestSlot)

  return (
    <section>
      <SectionHeader
        number="3"
        title="Is the AI working for you?"
        subtitle="Your focus ratings over the last 28 days — a rising trend means the schedule is helping"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-masss-white border border-masss-mint rounded-2xl p-5"
      >
        {/* Trend headline */}
        <div className="mb-5">
          {withData.length < 3 ? (
            <p className="text-sm text-masss-heading/50">
              Not enough sessions yet — keep studying and this chart will fill in.
            </p>
          ) : trendDiff > 0.05 ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-masss-accent" />
                <p className="text-sm font-bold text-masss-heading">
                  Your focus is improving{' '}
                  <span className="text-masss-accent">+{trendPct}%</span> this month
                </p>
              </div>
              <p className="text-xs text-masss-heading/50">
                Your {bestLabel} slot is your strongest — the AI keeps scheduling demanding tasks there.
              </p>
            </>
          ) : trendDiff < -0.05 ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={16} className="text-red-400" />
                <p className="text-sm font-bold text-masss-heading">
                  Focus has dipped{' '}
                  <span className="text-red-400">{trendPct}%</span> recently
                </p>
              </div>
              <p className="text-xs text-masss-heading/50">
                The AI has detected this and is reducing hard tasks until your ratings recover.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Minus size={16} className="text-masss-heading/40" />
                <p className="text-sm font-bold text-masss-heading">Focus is holding steady</p>
              </div>
              <p className="text-xs text-masss-heading/50">
                No strong trend yet. Keep consistent sessions to help the AI learn your patterns.
              </p>
            </>
          )}
        </div>

        {/* 28-day bar chart */}
        <div className="flex items-end gap-0.5 h-20 mb-2">
          {chartData.map((d, i) => {
            const hasData   = d.avg !== null
            const heightPct = hasData ? Math.max(8, Math.round((d.avg / 5) * 100)) : 0
            const col       = hasData
              ? d.avg >= 4 ? '#0FA89E' : d.avg >= 3 ? '#F59E0B' : '#EF4444'
              : '#E2F8F6'
            const isToday   = i === 27

            return (
              <motion.div
                key={d.date}
                className="flex-1 rounded-sm cursor-default"
                style={{
                  height:     `${hasData ? heightPct : 4}%`,
                  background: col,
                  opacity:    hasData ? 1 : 0.3,
                  outline:    isToday ? '2px solid #0FA89E' : 'none',
                }}
                initial={{ scaleY: 0, originY: '100%' }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.012, duration: 0.3 }}
                title={
                  hasData
                    ? `${d.date}: avg ${d.avg.toFixed(1)}/5 (${d.count} session${d.count !== 1 ? 's' : ''})`
                    : d.date
                }
              />
            )
          })}
        </div>

        {/* X-axis */}
        <div className="flex justify-between mb-4">
          <span className="text-[10px] text-masss-heading/30">28 days ago</span>
          <span className="text-[10px] text-masss-heading/30">14 days ago</span>
          <span className="text-[10px] text-masss-accent font-semibold">Today</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { colour: '#0FA89E', label: 'Great (4–5)' },
            { colour: '#F59E0B', label: 'Okay (3)' },
            { colour: '#EF4444', label: 'Low (1–2)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: l.colour }} />
              <span className="text-[10px] text-masss-heading/40">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-sm shrink-0 bg-masss-mint" />
            <span className="text-[10px] text-masss-heading/30">No session</span>
          </div>
        </div>

        <Collapse label="What does this tell the AI?">
          Every focus rating after a Pomodoro becomes a training signal. Consistently high ratings in a
          slot teach the AI that time window is strong for you — harder tasks get placed there. A falling
          trend triggers fatigue avoidance, softening your schedule until ratings recover. The more sessions
          you complete, the better the AI calibrates to your personal patterns.
        </Collapse>
      </motion.div>
    </section>
  )
}