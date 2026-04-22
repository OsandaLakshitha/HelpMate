// frontend/src/features/masss/pages/DashboardPage.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame, Brain, CalendarDays, TrendingUp,
  TrendingDown, Minus, Timer, Zap, BarChart3,
} from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError } from '../components/layout/PageWrapper'
import { useStateVector } from '../hooks/useStateVector'
import { useDashboard }   from '../hooks/useDashboard'
import { useSchedule }    from '../hooks/useSchedule'
import { getCurrentSlot, slotDefaultLabel, fatigueLabel } from '../utils/slotUtils'

// ── Bento card base ────────────────────────────────────────────────────────
const Card = ({ children, className = '', onClick }) => (
  <motion.div
    whileHover={onClick ? { y: -2 } : {}}
    onClick={onClick}
    className={[
      'bg-masss-white border border-masss-mint rounded-2xl p-5',
      onClick ? 'cursor-pointer' : '',
      className,
    ].join(' ')}
  >
    {children}
  </motion.div>
)

const CardLabel = ({ children }) => (
  <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-3">
    {children}
  </p>
)

export default function DashboardPage() {
  const navigate                             = useNavigate()
  const activeSlot                           = getCurrentSlot()
  const { stateVector, loading: svLoading }  = useStateVector(activeSlot)
  const { summary,    loading: sumLoading }  = useDashboard()
  const { rlSchedule, rlLoading }            = useSchedule(activeSlot)

  if (svLoading || sumLoading) return <PageLoader />

  const fatigue      = stateVector?.cognitive_fatigue ?? 0
  const fatLabel     = fatigueLabel(fatigue)
  const intensity    = stateVector?.workload_intensity ?? 0
  const energyBat    = stateVector?.energy_battery ?? {}
  const recentRatings = summary?.recent_ratings ?? []
  const streak       = summary?.streak_days ?? 0
  const sessionsToday = summary?.sessions_today ?? 0
  const bestFocus    = summary?.best_focus_week ?? 0

  const trend = recentRatings.length >= 2
    ? recentRatings[recentRatings.length - 1] - recentRatings[recentRatings.length - 2]
    : 0

  const slotLabels = stateVector?.slot_labels ?? {}
  const todaySlots = rlSchedule ?? { morning: [], afternoon: [], evening: [] }

  return (
    <PageWrapper>
      {/* <PageHeader
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      /> */}

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-6">

        {/* ── Card 1: Today's Schedule ──────────────────────────── */}
        <Card className="lg:col-span-2" onClick={() => navigate('/masss/schedule')}>
          <div className="flex items-center justify-between mb-4">
            <CardLabel>Today's Plan</CardLabel>
            <span className={[
              'text-xs px-2.5 py-0.5 rounded-full font-medium',
              rlSchedule?.strategy_used === 'rl_ppo'
                ? 'bg-masss-mint text-masss-accent'
                : 'bg-masss-bg text-masss-heading/50',
            ].join(' ')}>
              {rlSchedule?.strategy_used === 'rl_ppo' ? '✦ AI-generated' : 'Priority-based'}
            </span>
          </div>

          {rlLoading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-masss-mint border-t-masss-accent masss-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {['morning', 'afternoon', 'evening'].map(slot => {
                const tasks = todaySlots[slot] || []
                const label = slotLabels[slot] || slotDefaultLabel(slot)
                const isActive = slot === activeSlot
                return (
                  <div
                    key={slot}
                    className={[
                      'p-3 rounded-xl border',
                      isActive ? 'border-masss-accent bg-masss-bg' : 'border-masss-mint bg-masss-bg/50',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-masss-accent animate-pulse" />
                      )}
                      <p className="text-xs font-semibold text-masss-heading">{label}</p>
                    </div>
                    {tasks.length === 0 ? (
                      <p className="text-xs text-masss-heading/30">No tasks</p>
                    ) : (
                      <div className="space-y-1">
                        {tasks.slice(0, 3).map((t, i) => (
                          <p key={i} className="text-xs text-masss-heading/70 truncate">
                            · {t.task_name}
                          </p>
                        ))}
                        {tasks.length > 3 && (
                          <p className="text-xs text-masss-accent">+{tasks.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Work intensity bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-masss-heading/50">Workload intensity</p>
              <p className="text-xs font-semibold text-masss-heading">{Math.round(intensity * 100)}%</p>
            </div>
            <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${intensity * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-masss-accent rounded-full"
              />
            </div>
          </div>
        </Card>

        {/* ── Card 2: Cognitive State ───────────────────────────── */}
        <Card onClick={() => navigate('/masss/ai-insights')}>
          <CardLabel>Cognitive State</CardLabel>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#C7F0EB" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#0FA89E"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - fatigue) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-masss-heading">
                  {Math.round(fatigue * 100)}%
                </span>
              </div>
            </div>
            <span className={[
              'px-3 py-1 rounded-full text-xs font-semibold',
              fatigue < 0.4  ? 'bg-masss-mint text-masss-accent' :
              fatigue < 0.7  ? 'bg-amber-100 text-amber-700' :
                               'bg-red-100 text-red-600',
            ].join(' ')}>
              {fatLabel.label}
            </span>
          </div>

          {/* Slot energy bars */}
          <div className="mt-4 space-y-2">
            {['morning','afternoon','evening'].map(slot => {
              const energy = energyBat[slot]?.score ?? 0
              const label  = slotLabels[slot] || slotDefaultLabel(slot)
              return (
                <div key={slot}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-masss-heading/60 capitalize">{label}</span>
                    <span className="text-masss-accent font-medium">{energy.toFixed(1)}</span>
                  </div>
                  <div className="h-1 bg-masss-mint rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(energy / 5) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-masss-accent rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ── Card 3: Focus Streak ──────────────────────────────── */}
        <Card>
          <CardLabel>Focus Streak</CardLabel>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-masss-mint rounded-xl flex items-center justify-center">
              <Flame size={22} className="text-masss-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold text-masss-heading leading-none">{streak}</p>
              <p className="text-xs text-masss-heading/50 mt-0.5">day streak</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-masss-bg rounded-xl border border-masss-mint text-center">
              <p className="text-lg font-bold text-masss-heading">{sessionsToday}</p>
              <p className="text-xs text-masss-heading/50">sessions today</p>
            </div>
            <div className="p-3 bg-masss-bg rounded-xl border border-masss-mint text-center">
              <p className="text-lg font-bold text-masss-heading">{bestFocus.toFixed(1)}</p>
              <p className="text-xs text-masss-heading/50">best focus / 5</p>
            </div>
          </div>
        </Card>

        {/* ── Card 4: Heartbeat Chart ───────────────────────────── */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <CardLabel>Focus History</CardLabel>
            <div className="flex items-center gap-1.5 text-xs text-masss-heading/50">
              {trend > 0 && <><TrendingUp size={13} className="text-masss-accent" /><span className="text-masss-accent">Improving</span></>}
              {trend < 0 && <><TrendingDown size={13} className="text-amber-500" /><span className="text-amber-500">Declining</span></>}
              {trend === 0 && <><Minus size={13} /><span>Steady</span></>}
            </div>
          </div>

          {recentRatings.length === 0 ? (
            <div className="h-24 flex items-center justify-center">
              <p className="text-sm text-masss-heading/40">No sessions recorded yet</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-20">
              {recentRatings.map((r, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(r / 5) * 80}px` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full rounded-t-sm"
                    style={{
                      background: r >= 4 ? '#0FA89E' : r >= 3 ? '#C7F0EB' : r >= 2 ? '#FCD34D' : '#FCA5A5',
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[10px] text-masss-heading/40">{r}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </PageWrapper>
  )
}