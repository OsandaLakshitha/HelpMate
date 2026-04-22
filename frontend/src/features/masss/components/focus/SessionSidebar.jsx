// frontend/src/features/masss/components/focus/SessionSidebar.jsx

import React from 'react'
import { Clock, Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { MODE, SESSIONS_BEFORE_LONG, WORK_DURATION } from './constants'

// ... buildSteps and getStepStatus functions remain exactly the same ...
const buildSteps = (displayTotal, totalSessions) => {
  const steps = []
  for (let i = 1; i <= displayTotal; i++) {
    steps.push({
      type: 'WORK',
      index: i,
      label: i > totalSessions ? 'Extra Focus' : 'Focus Session',
      time: '25 min',
    })
    if (i < displayTotal) {
      const long = i % SESSIONS_BEFORE_LONG === 0
      steps.push({
        type: long ? 'LONG_BREAK' : 'SHORT_BREAK',
        index: i,
        label: long ? 'Long Break' : 'Short Break',
        time: long ? '15 min' : '5 min',
      })
    }
  }
  return steps
}

const getStepStatus = (step, currentSessionNum, mode) => {
  if (step.type === 'WORK') {
    if (step.index < currentSessionNum) return 'COMPLETED'
    if (step.index === currentSessionNum) 
      return (mode === MODE.RUNNING || mode === MODE.PAUSED) ? 'ACTIVE' : 'FUTURE'
    return 'FUTURE'
  }
  if (step.index < currentSessionNum - 1) return 'COMPLETED'
  if (step.index === currentSessionNum - 1) {
    if (mode === MODE.BREAK || mode === MODE.BREAK_PROMPT) return 'ACTIVE'
    return 'COMPLETED'
  }
  return 'FUTURE'
}

export const SessionSidebar = ({ totalSessions, currentSessionNum, mode }) => {
  const displayTotal = Math.max(totalSessions, currentSessionNum)
  const completedCount = currentSessionNum - 1
  const totalMins = completedCount * (WORK_DURATION / 60)
  const hours = Math.floor(totalMins / 60)
  const mins = Math.round(totalMins % 60)
  const steps = buildSteps(displayTotal, totalSessions)


  return (
    
    <div className="flex h-full w-full shrink-0 flex-col overflow-hidden border-b border-slate-800 bg-[#0D1B2A] p-4 md:h-full md:w-72 md:border-b-0 md:border-r lg:w-80 lg:p-6">
      {/* FIXED HEADER SECTION */}
      <div className="shrink-0 mb-8 p-5 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
          <Clock size={14} /> Total Focus Time
        </div>
        <div className="text-3xl font-bold text-white tabular-nums">
          {hours > 0 ? `${hours}h ` : ''}{mins}m
        </div>
        <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">Excluding breaks</div>
      </div>

      {/* SCROLLABLE SESSION AREA */}
      <div className="flex-1 overflow-y-auto masss-scroll pr-2 min-h-0">
        <div className="relative min-h-full py-4">
          {/* Timeline line now follows content height, so it grows with new steps */}
          <div className="absolute left-[25px] top-6 bottom-4 w-px bg-slate-800 z-0" />

          {steps.map((step, idx) => {
            const status = getStepStatus(step, currentSessionNum, mode)

            return (
              <div key={idx} className={cn(
                'relative z-10 flex items-center gap-4 mb-6 transition-all duration-500',
                status === 'ACTIVE' ? 'opacity-100 scale-105' : 'opacity-70 '
              )}>
                <div className={cn(
                  'w-10 h-10 m-2 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-300 ',
                  status === 'ACTIVE' ? 'bg-masss-accent border-masss-accent shadow-[0_0_15px_rgba(15,168,158,0.4)]' :
                  status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900 border-slate-700'
                )}>
                  {status === 'COMPLETED' ? <Check size={16} className="text-white" /> :
                   step.type === 'WORK' && <span className="text-[11px] font-bold text-white">{step.index}</span>}
                </div>

                <div className="flex flex-col">
                  <span className={cn(
                    'text-sm transition-colors',
                    status === 'ACTIVE' ? 'text-white font-bold' :
                    status === 'COMPLETED' ? 'text-emerald-500/80 line-through' : 'text-slate-500'
                  )}>{step.label}</span>
                  <span className="text-[10px] text-slate-600 font-mono uppercase">{step.time}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}