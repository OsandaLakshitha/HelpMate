// frontend/src/features/masss/pages/FocusPage.jsx

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Square, X, RotateCcw, FastForward,
  Coffee, Armchair, Check, Clock, Star,
  ChevronRight, CheckCircle,
} from 'lucide-react'
import { cn }           from '../utils/cn'
import { useTasks }     from '../hooks/useTasks'
import { useModules }   from '../hooks/useModules'
import { useSessions }  from '../hooks/useSessions'

// ── Constants ─────────────────────────────────────────────────────────────────
const WORK_DURATION         = 25 * 60
const SHORT_BREAK           = 5  * 60
const LONG_BREAK            = 15 * 60
const SESSIONS_BEFORE_LONG  = 4

// ── Modes ─────────────────────────────────────────────────────────────────────
const MODE = {
  LOBBY:        'LOBBY',
  RUNNING:      'RUNNING',
  PAUSED:       'PAUSED',
  FEEDBACK:     'FEEDBACK',
  BREAK:        'BREAK',
  BREAK_PROMPT: 'BREAK_PROMPT',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ── Session Sidebar ───────────────────────────────────────────────────────────
const SessionSidebar = ({ totalSessions, currentSessionNum, mode }) => {
  const displayTotal     = Math.max(totalSessions, currentSessionNum)
  const completedCount   = currentSessionNum - 1
  const totalMins        = completedCount * 25
  const hours            = Math.floor(totalMins / 60)
  const mins             = totalMins % 60

  // Build timeline: Work → Break → Work → Break...
  const steps = []
  for (let i = 1; i <= displayTotal; i++) {
    steps.push({ type: 'WORK', index: i,
      label: i > totalSessions ? 'Extra Focus' : 'Focus Session', time: '25 min' })
    if (i < displayTotal) {
      const long = i % SESSIONS_BEFORE_LONG === 0
      steps.push({ type: long ? 'LONG_BREAK' : 'SHORT_BREAK', index: i,
        label: long ? 'Long Break' : 'Short Break', time: long ? '15 min' : '5 min' })
    }
  }

  const getStatus = (step) => {
    if (step.type === 'WORK') {
      if (step.index < currentSessionNum) return 'COMPLETED'
      if (step.index === currentSessionNum)
        return mode === MODE.BREAK || mode === MODE.BREAK_PROMPT ? 'COMPLETED' : 'ACTIVE'
      return 'FUTURE'
    }
    if (step.index < currentSessionNum - 1) return 'COMPLETED'
    if (step.index === currentSessionNum - 1 &&
        (mode === MODE.BREAK || mode === MODE.BREAK_PROMPT)) return 'ACTIVE'
    return 'FUTURE'
  }

  return (
    <div className="w-72 h-full bg-masss-white border-r border-masss-mint flex flex-col p-5 overflow-hidden shrink-0">

      {/* Total focus time header */}
      <div className="mb-6 p-4 bg-masss-bg rounded-2xl border border-masss-mint">
        <div className="flex items-center gap-2 text-masss-heading/50 text-xs font-bold uppercase tracking-widest mb-1">
          <Clock size={13} />
          Total Focus Time
        </div>
        <div className="text-3xl font-mono font-bold text-masss-heading">
          {hours > 0 ? `${hours}h ` : ''}{mins}m
        </div>
        <div className="text-xs text-masss-heading/40 mt-0.5">Excluding breaks</div>
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto masss-scroll pr-1 relative">

        {/* Continuous vertical line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-masss-mint z-0" />

        {steps.map((step, idx) => {
          const status = getStatus(step)

          let dotClass = 'bg-masss-bg border-masss-mint'
          let textClass = 'text-masss-heading/40'

          if (step.type === 'WORK') {
            if (status === 'ACTIVE') {
              dotClass = 'bg-masss-accent border-masss-accent shadow-[0_0_8px_#0FA89E] scale-110'
              textClass = 'text-masss-heading font-bold'
            } else if (status === 'COMPLETED') {
              dotClass = 'bg-masss-accent border-masss-accent'
              textClass = 'text-masss-heading/50 line-through'
            }
          } else if (step.type === 'SHORT_BREAK') {
            if (status === 'ACTIVE') {
              dotClass = 'bg-blue-400 border-blue-400'
              textClass = 'text-blue-500 font-bold'
            } else if (status === 'COMPLETED') {
              dotClass = 'bg-blue-100 border-blue-100'
            }
          } else if (step.type === 'LONG_BREAK') {
            if (status === 'ACTIVE') {
              dotClass = 'bg-amber-400 border-amber-400'
              textClass = 'text-amber-500 font-bold'
            } else if (status === 'COMPLETED') {
              dotClass = 'bg-amber-100 border-amber-100'
            }
          }

          return (
            <div
              key={idx}
              className={cn(
                'relative z-10 flex items-center gap-3 mb-5 transition-all duration-300',
                status === 'ACTIVE' ? 'opacity-100 scale-[1.02]' : 'opacity-60',
              )}
            >
              {/* Dot */}
              <div className={cn(
                'w-10 h-10 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-300',
                dotClass,
              )}>
                {status === 'COMPLETED' && <Check size={14} className="text-white" />}
                {step.type === 'WORK' && status !== 'COMPLETED' && (
                  <span className="text-[11px] font-bold text-masss-white">{step.index}</span>
                )}
              </div>

              {/* Text */}
              <div>
                <p className={cn('text-sm transition-colors', textClass)}>{step.label}</p>
                <p className="text-xs text-masss-heading/30 font-mono">{step.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-2">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={34}
            className={cn(
              'transition-colors',
              n <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-masss-mint',
            )}
          />
        </button>
      ))}
    </div>
  )
}

// ── Btn ───────────────────────────────────────────────────────────────────────
const Btn = ({
  children, onClick, disabled, variant = 'primary',
  size = 'md', icon, fullWidth, className = '',
}) => {
  const sizes    = { sm: 'px-4 py-2 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-sm', xl: 'px-10 py-5 text-lg' }
  const variants = {
    primary:   'bg-masss-accent text-white hover:opacity-90',
    secondary: 'bg-masss-bg border border-masss-mint text-masss-heading hover:bg-masss-mint',
    ghost:     'bg-transparent text-masss-heading/50 hover:text-masss-heading',
    danger:    'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
    success:   'bg-masss-mint text-masss-heading hover:bg-masss-accent hover:text-white',
    white:     'bg-white text-masss-heading border border-masss-mint hover:bg-masss-bg',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
        'transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        sizes[size], variants[variant],
        fullWidth && 'w-full',
        className,
      )}
    >
      {icon && icon}
      {children}
    </button>
  )
}

// ── Inline Feedback Form ──────────────────────────────────────────────────────
const FeedbackForm = ({
  onContinue, onCompleteTask, onStopForNow, onDiscard, loading,
}) => {
  const [rating, setRating] = useState(0)

  const ratingLabel = {
    5: 'Outstanding 🔥', 4: 'Great session ✨',
    3: 'Decent work 👍',  2: 'A bit rough 😓', 1: 'Tough session 😕',
  }

  return (
    <div className="bg-masss-white border border-masss-mint rounded-2xl p-7 w-full max-w-sm mx-auto shadow-sm space-y-6">
      <div className="text-center">
        <h3 className="font-bold text-xl text-masss-heading">How was your focus?</h3>
        <p className="text-sm text-masss-heading/50 mt-1">Rate this session before continuing</p>
      </div>

      <div className="flex justify-center">
        <StarRating value={rating} onChange={setRating} />
      </div>

      {rating > 0 && (
        <p className="text-center text-sm text-masss-heading/60">{ratingLabel[rating]}</p>
      )}

      <div className="space-y-2">
        <Btn fullWidth variant="primary" size="md" icon={<ChevronRight size={15} />}
          disabled={rating === 0 || loading} onClick={() => onContinue(rating)}>
          {loading ? 'Saving...' : 'Continue to next session'}
        </Btn>
        <Btn fullWidth variant="secondary" size="md" icon={<Coffee size={15} />}
          disabled={rating === 0 || loading} onClick={() => onStopForNow(rating)}>
          Stop for now
        </Btn>
        <Btn fullWidth variant="success" size="md" icon={<CheckCircle size={15} />}
          disabled={rating === 0 || loading} onClick={() => onCompleteTask(rating)}>
          Task complete ✓
        </Btn>
        <Btn fullWidth variant="ghost" size="sm" icon={<X size={13} />}
          disabled={loading} onClick={onDiscard}
          className="text-masss-heading/40">
          Discard session
        </Btn>
      </div>
    </div>
  )
}

// ── Focus Page ────────────────────────────────────────────────────────────────
export default function FocusPage() {
  const { taskId }                   = useParams()
  const navigate                     = useNavigate()
  const { tasks }                    = useTasks()
  const { modules }                  = useModules()
  const { startSession, endSession } = useSessions()

  // ── State ────────────────────────────────────────────────────────────────
  const [mode,        setMode]        = useState(MODE.LOBBY)
  const [seconds,     setSeconds]     = useState(0)
  const [sessionId,   setSessionId]   = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [starting,    setStarting]    = useState(false)

  // Completed sessions for this focus window (separate from task.sessionsCount)
  const [completed,   setCompleted]   = useState(0)

  const intervalRef = useRef(null)

  // ── Derived ──────────────────────────────────────────────────────────────
  const task   = tasks.find(t => t._id === taskId)
  const module = modules.find(m => m._id === (task?.moduleId?._id || task?.moduleId))
  const color  = module?.color || '#0FA89E'

  // Use task's existing sessions + sessions in this window
  const baseCount       = task?.sessionsCount ?? 0
  const currentNum      = baseCount + completed + 1
  const totalSessions   = Math.max(task?.estimatedPomodoros ?? 0, currentNum)
  const isOvertime      = currentNum > (task?.estimatedPomodoros ?? 0)

  const nextBreakIsLong = (baseCount + completed + 1) % SESSIONS_BEFORE_LONG === 0
  const breakTotal      = nextBreakIsLong ? LONG_BREAK : SHORT_BREAK
  const isBreakMode     = mode === MODE.BREAK

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== MODE.RUNNING && mode !== MODE.BREAK) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1
        if (mode === MODE.RUNNING && next >= WORK_DURATION) {
          setMode(MODE.FEEDBACK)
          clearInterval(intervalRef.current)
        }
        if (mode === MODE.BREAK && next >= breakTotal) {
          setMode(MODE.BREAK_PROMPT)
          clearInterval(intervalRef.current)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [mode, breakTotal])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (starting || !taskId) return
    try {
      setStarting(true)
      const s = await startSession(taskId)
      setSessionId(s._id)
      setSeconds(0)
      setMode(MODE.RUNNING)
    } catch (err) {
      console.error('Start session error:', err.message)
    } finally {
      setStarting(false)
    }
  }

  const handleRestart = async () => {
    if (!window.confirm('Restart timer? This session will be discarded.')) return
    if (sessionId) {
      await endSession(sessionId, { end_type: 'aborted', focus_rating: 1 })
    }
    setSeconds(0)
    handleStart()
  }

  const handleStop = () => {
    clearInterval(intervalRef.current)
    setMode(MODE.FEEDBACK)
  }

  // Continue to next session
  const handleContinue = async (rating) => {
    try {
      setLoading(true)
      await endSession(sessionId, { end_type: 'completed', focus_rating: rating })
      setCompleted(c => c + 1)
      setSessionId(null)
      setSeconds(0)
      setMode(MODE.BREAK_PROMPT)
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Complete task entirely
  const handleCompleteTask = async (rating) => {
    try {
      setLoading(true)
      await endSession(sessionId, { end_type: 'completed', focus_rating: rating })
      navigate('/masss/tasks')
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Stop for now — save and close
  const handleStopForNow = async (rating) => {
    try {
      setLoading(true)
      await endSession(sessionId, { end_type: 'stopped', focus_rating: rating })
      navigate('/masss/sessions')
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Discard — aborted, back to lobby
  const handleDiscard = async () => {
    try {
      setLoading(true)
      if (sessionId) {
        await endSession(sessionId, { end_type: 'aborted', focus_rating: 1 })
      }
      setSessionId(null)
      setSeconds(0)
      setMode(MODE.LOBBY)
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Accept break
  const handleAcceptBreak = () => {
    setSeconds(0)
    setMode(MODE.BREAK)
  }

  // Skip break → start next session immediately
  const handleSkipBreak = async () => {
    setSeconds(0)
    await handleStart()
  }

  // ── No task guard ─────────────────────────────────────────────────────────
  if (!taskId || (!task && tasks.length > 0)) {
    return (
      <div className="fixed inset-0 bg-masss-bg flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <p className="text-masss-heading font-semibold">No task selected</p>
          <Btn variant="secondary" onClick={() => navigate('/masss/tasks')}
            icon={<X size={14} />}>
            Back to Tasks
          </Btn>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-masss-bg flex items-center justify-center z-50">
        <div className="w-8 h-8 rounded-full border-2 border-masss-mint border-t-masss-accent masss-spin" />
      </div>
    )
  }

  // ── Full screen overlay ───────────────────────────────────────────────────
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex text-masss-heading transition-colors duration-700',
      isBreakMode ? 'bg-[#EFF8F7]' : 'bg-masss-bg',
    )}>

      {/* Sidebar */}
      <SessionSidebar
        totalSessions={totalSessions}
        currentSessionNum={currentNum}
        mode={mode}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">

        {/* Per-module background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15, transparent 55%)` }}
        />

        {/* Mode label top-left */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-masss-heading/40 font-semibold uppercase tracking-widest text-sm">
          {isBreakMode
            ? <><Armchair size={20} /> Break Time</>
            : <><Coffee size={20} /> Focus Mode</>
          }
        </div>

        {/* Close / Stop button top-right */}
        {mode !== MODE.FEEDBACK && (
          <button
            onClick={() => mode === MODE.LOBBY ? navigate(-1) : handleStop()}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-masss-mint text-masss-heading/40 hover:text-masss-heading transition-colors"
          >
            <X size={22} />
          </button>
        )}

        {/* Phase content */}
        <AnimatePresence mode="wait">

          {/* ── LOBBY ───────────────────────────────────────────── */}
          {mode === MODE.LOBBY && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-8 px-8"
            >
              <div>
                <p className="text-masss-heading/40 uppercase tracking-widest text-xs mb-3">Ready?</p>
                {module && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-sm text-masss-heading/60">{module.name}</span>
                  </div>
                )}
                <h1 className="text-4xl font-bold text-masss-heading max-w-2xl leading-snug">
                  {task.name}
                </h1>
                <p className="mt-3 text-masss-heading/50 font-medium">
                  {isOvertime
                    ? <span className="text-amber-500 font-semibold">Overtime Session</span>
                    : `Session ${currentNum} of ${totalSessions}`
                  }
                </p>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-masss-heading tabular-nums">{task.sessionsCount ?? 0}</p>
                  <p className="text-xs text-masss-heading/50 mt-1">sessions done</p>
                </div>
                <div className="w-px h-8 bg-masss-mint" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-masss-accent tabular-nums">
                    {Math.max(0, (task.estimatedPomodoros ?? 0) - (task.sessionsCount ?? 0))}
                  </p>
                  <p className="text-xs text-masss-heading/50 mt-1">remaining</p>
                </div>
                <div className="w-px h-8 bg-masss-mint" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-masss-heading tabular-nums">{completed}</p>
                  <p className="text-xs text-masss-heading/50 mt-1">this streak</p>
                </div>
              </div>

              {/* Difficulty hint */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-masss-white border border-masss-mint rounded-full">
                <span className="text-xs text-masss-heading/50">
                  25 min · {task.difficulty ?? '—'}/5 difficulty
                </span>
              </div>

              <Btn
                size="xl"
                variant="primary"
                icon={<Play size={20} fill="currentColor" />}
                disabled={starting}
                onClick={handleStart}
                className="min-w-[200px]"
              >
                {starting ? 'Starting...' : 'Start Session'}
              </Btn>
            </motion.div>
          )}

          {/* ── RUNNING / PAUSED / BREAK ─────────────────────────── */}
          {(mode === MODE.RUNNING || mode === MODE.PAUSED || mode === MODE.BREAK) && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{   opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-10 text-center z-10"
            >
              {/* Label */}
              <h2 className={cn(
                'font-medium uppercase tracking-widest text-sm',
                isBreakMode ? 'text-masss-accent' : 'text-masss-heading/50',
              )}>
                {isBreakMode
                  ? (nextBreakIsLong ? 'Long Break · Recharge' : 'Short Break · Breathe')
                  : task.name
                }
              </h2>

              {/* Giant clock */}
              <div
                className={cn(
                  'text-[120px] font-mono font-bold leading-none tabular-nums tracking-tighter',
                  isBreakMode ? 'text-masss-accent' : 'text-masss-heading',
                )}
              >
                {isBreakMode
                  ? fmt(Math.max(0, breakTotal - seconds))
                  : fmt(seconds)
                }
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                {isBreakMode ? (
                  <Btn
                    size="lg"
                    variant="primary"
                    icon={<FastForward size={20} fill="currentColor" />}
                    onClick={handleSkipBreak}
                  >
                    Skip Break & Start Work
                  </Btn>
                ) : (
                  <>
                    <button
                      onClick={handleRestart}
                      className="p-4 rounded-full bg-masss-bg border border-masss-mint text-masss-heading/50 hover:text-masss-heading hover:border-masss-accent transition-all"
                      title="Restart session"
                    >
                      <RotateCcw size={24} />
                    </button>

                    <button
                      onClick={() => setMode(mode === MODE.RUNNING ? MODE.PAUSED : MODE.RUNNING)}
                      className="w-24 h-24 flex items-center justify-center rounded-full bg-masss-accent text-white hover:opacity-90 transition-all shadow-lg shadow-masss-accent/30 hover:scale-105"
                    >
                      {mode === MODE.RUNNING
                        ? <Pause size={36} fill="currentColor" />
                        : <Play  size={36} fill="currentColor" className="ml-1" />
                      }
                    </button>

                    <button
                      onClick={handleStop}
                      className="p-4 rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      title="Stop & log session"
                    >
                      <Square size={24} fill="currentColor" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── FEEDBACK ─────────────────────────────────────────── */}
          {mode === MODE.FEEDBACK && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm px-4"
            >
              <FeedbackForm
                onContinue={handleContinue}
                onCompleteTask={handleCompleteTask}
                onStopForNow={handleStopForNow}
                onDiscard={handleDiscard}
                loading={loading}
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── BREAK PROMPT modal ─────────────────────────────────── */}
        <AnimatePresence>
          {mode === MODE.BREAK_PROMPT && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-masss-heading/20 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{   scale: 0.95, opacity: 0 }}
                className="bg-masss-white border border-masss-mint rounded-2xl p-8 max-w-sm w-full text-center shadow-xl space-y-5"
              >
                <div className="text-5xl">
                  {nextBreakIsLong ? '☕' : '🌿'}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-masss-heading mb-2">Great Job!</h2>
                  <p className="text-masss-heading/60 text-sm">
                    You've finished session {baseCount + completed}.<br />
                    Time for a{' '}
                    <span className={cn(
                      'font-bold',
                      nextBreakIsLong ? 'text-amber-500' : 'text-masss-accent',
                    )}>
                      {nextBreakIsLong ? '15 min Long Break' : '5 min Short Break'}
                    </span>?
                  </p>
                </div>

                {/* Session dots */}
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: SESSIONS_BEFORE_LONG }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2.5 h-2.5 rounded-full transition-all',
                        i < ((baseCount + completed) % SESSIONS_BEFORE_LONG)
                          ? 'bg-masss-accent'
                          : 'bg-masss-mint',
                      )}
                    />
                  ))}
                </div>

                <div className="space-y-2.5">
                  <Btn fullWidth variant="primary" size="md" onClick={handleAcceptBreak}>
                    Accept Break
                  </Btn>
                  <Btn fullWidth variant="secondary" size="md" onClick={handleSkipBreak}>
                    Skip & Start Next Session
                  </Btn>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase indicator footer bar ─────────────────────────── */}
        {(mode === MODE.RUNNING || mode === MODE.PAUSED || mode === MODE.BREAK) && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-masss-white/90 backdrop-blur border border-masss-mint rounded-full shadow-sm">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              mode === MODE.RUNNING ? 'bg-masss-accent animate-pulse' :
              mode === MODE.BREAK   ? 'bg-masss-accent'               :
              'bg-amber-400',
            )} />
            <span className="text-xs text-masss-heading/70 font-medium">
              {mode === MODE.RUNNING ? 'Session active' :
               mode === MODE.BREAK   ? 'Break time'     :
               'Paused'}
            </span>
            <span className="text-xs text-masss-heading/40">
              · Session {currentNum}
            </span>
          </div>
        )}

      </div>
    </div>
  )
}