// frontend/src/features/masss/components/dashboard/FocusStreakCard.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Star, Clock } from 'lucide-react'

const ratingColour = (r) =>
  r >= 4 ? '#0FA89E' : r >= 3 ? '#F59E0B' : '#EF4444'

const streakMessage = (s) =>
  s === 0 ? 'Start today'         :
  s === 1 ? 'Keep going!'         :
  s < 7   ? 'Building up 🔥'      :
             'On fire! 🚀'

export default function FocusStreakCard({ summary }) {
  const streak        = summary?.streak_days      ?? 0
  const sessionsToday = summary?.sessions_today   ?? 0
  const bestFocus     = summary?.best_focus_week  ?? 0
  const avgFocus      = summary?.recent_avg_focus ?? 0
  const recentRatings = summary?.recent_ratings   ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-masss-white border border-masss-mint rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Flame size={14} className="text-masss-accent" />
        <p className="text-xs font-bold text-masss-heading/50 uppercase tracking-wider">Streak</p>
      </div>

      {/* Streak hero */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: streak > 0 ? '#0FA89E18' : '#F8FFFE',
            border:     `1.5px solid ${streak > 0 ? '#0FA89E40' : '#C7F0EB'}`,
          }}
        >
          <Flame size={20} className={streak > 0 ? 'text-masss-accent' : 'text-masss-heading/20'} />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-masss-heading leading-none">{streak}</span>
            <span className="text-xs text-masss-heading/40">days</span>
          </div>
          <p className="text-[10px] text-masss-heading/50 mt-0.5">{streakMessage(streak)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {[
          { icon: Clock, value: sessionsToday,       label: 'today'   },
          { icon: Star,  value: bestFocus.toFixed(1), label: 'best'   },
          { icon: null,  value: avgFocus.toFixed(1),  label: 'avg'    },
        ].map((s, i) => (
          <div key={i} className="p-2 bg-masss-bg rounded-xl border border-masss-mint text-center">
            {s.icon && <s.icon size={9} className="text-masss-accent mx-auto mb-0.5" />}
            <p className="text-sm font-bold text-masss-heading leading-none">{s.value}</p>
            <p className="text-[9px] text-masss-heading/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

    </motion.div>
  )
}