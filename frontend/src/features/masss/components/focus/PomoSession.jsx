// frontend/src/features/masss/components/focus/PomoSession.jsx

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Square, X,
  RotateCcw, FastForward,
  Coffee, Armchair, AlertTriangle,
} from 'lucide-react'
import { cn }          from '../../utils/cn'
import { FeedbackForm } from './FeedbackForm'
import { FocusBtn }     from './FocusBtn'
import { MODE, fmt, SESSIONS_BEFORE_LONG } from './constants'

export const PomoSession = ({
  // state
  mode,
  seconds,
  task,
  starting,
  activeTaskId,
  loading,
  isBreakMode,
  nextBreakIsLong,
  breakTotal,
  currentWorkSessionNum,
  totalSessions,
  isOvertime,
  completedSessions,

  // handlers
  handleStart,
  handleStop,
  handleRestart,
  handleContinue,
  handleCompleteTask,
  handleStopForNow,
  handleDiscard,
  handleAcceptBreak,
  handleSkipBreak,
  setMode,

  showResetConfirm,
  setShowResetConfirm,

  // FIX 1 (cont): accepting the new conflict modal props passed down from FocusPage
  showConflict,
  setShowConflict,
  onConflictDismiss,

  navigate,
}) => {
  return (
    <>
      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center relative">

        {/* HEADER */}
        <div className="absolute top-8 left-8 flex items-center gap-3 opacity-40 font-bold tracking-[0.2em] text-sm uppercase">
          {isBreakMode ? <><Armchair size={22}/> Break Time</> : <><Coffee size={22}/> Focus Mode</>}
        </div>

        {/* CLOSE BUTTON */}
        {/* FIX 3: button was empty — X icon was imported but never rendered, making it invisible */}
        {mode !== MODE.FEEDBACK && (
          <button
            onClick={() => mode === MODE.LOBBY ? navigate('/masss/tasks') : handleStop()}
            className="absolute top-8 right-8 p-2 opacity-40 hover:opacity-100 transition-opacity"
          >
            <X size={20} />
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* --- LOBBY --- */}
          {mode === MODE.LOBBY && (
            <motion.div key="lobby" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center space-y-8"
            >
              <div>
                <h2 className="text-slate-500 uppercase tracking-widest text-xs mb-3 font-bold">Ready?</h2>
                <h1 className="text-4xl font-bold max-w-2xl">{task?.name || 'No Task Selected'}</h1>
                <p className="mt-3 text-slate-400 font-medium">
                  {isOvertime
                    ? <span className="text-amber-500">Overtime Session</span>
                    : `Session ${currentWorkSessionNum} of ${totalSessions}`}
                </p>
              </div>
              <button
                onClick={handleStart}
                disabled={starting || !activeTaskId}
                className="px-12 py-5 bg-white text-[#0D1B2A] font-bold text-xl rounded-full hover:scale-105 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
              >
                {starting
                  ? "STARTING..."
                  : <span className="flex items-center gap-3"><Play size={24} fill="currentColor"/> START SESSION</span>}
              </button>
            </motion.div>
          )}

          {/* --- TIMER --- */}
          {[MODE.RUNNING, MODE.PAUSED, MODE.BREAK].includes(mode) && (
            <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center z-10 w-full max-w-4xl"
            >
              <h2 className={cn("font-bold tracking-[0.2em] uppercase mb-8 text-xs",
                isBreakMode ? "text-masss-accent" : "text-slate-500")}>
                {isBreakMode
                  ? (nextBreakIsLong ? "Long Break • Recharge" : "Short Break • Breathe")
                  : task?.name}
              </h2>

              <div className={cn("text-[160px] font-bold leading-none tabular-nums tracking-tighter select-none",
                isBreakMode ? "text-masss-accent" : "text-white")}>
                {isBreakMode ? fmt(Math.max(0, breakTotal - seconds)) : fmt(seconds)}
              </div>

              <div className="flex items-center gap-10 mt-16 justify-center">
                {isBreakMode ? (
                  <button onClick={handleSkipBreak}
                    className="px-10 py-5 bg-masss-accent text-white font-bold rounded-full flex items-center gap-3 hover:scale-105 transition-all shadow-lg shadow-masss-accent/20">
                    <FastForward size={24} fill="currentColor"/> Skip Break & Start Work
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="p-5 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-all border border-slate-700"
                    >
                      <RotateCcw size={28} />
                    </button>
                    <button
                      onClick={() => setMode(mode === MODE.RUNNING ? MODE.PAUSED : MODE.RUNNING)}
                      className="w-24 h-24 flex items-center justify-center rounded-full bg-white text-[#0D1B2A] hover:scale-105 transition-all shadow-2xl"
                    >
                      {mode === MODE.RUNNING
                        ? <Pause size={42} fill="currentColor" />
                        : <Play  size={42} fill="currentColor" className="ml-1" />}
                    </button>
                    <button onClick={handleStop}
                      className="p-5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                      <Square size={28} fill="currentColor" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* --- FEEDBACK FORM --- */}
          {mode === MODE.FEEDBACK && (
            <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <FeedbackForm
                onContinue={handleContinue}
                onCompleteTask={handleCompleteTask}
                onStopForNow={handleStopForNow}
                onDiscard={handleDiscard}
                loading={loading}
              />
            </motion.div>
          )}

          {/* --- BREAK PROMPT --- */}
          {mode === MODE.BREAK_PROMPT && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#0D1B2A]/90 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl space-y-6">
                <div className="text-5xl">{nextBreakIsLong ? '☕' : '🌿'}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Great Job!</h2>
                  <p className="text-slate-400 text-sm">
                    You've finished session {completedSessions}.<br/>
                    Time for a{' '}
                    <span className={cn("font-bold", nextBreakIsLong ? "text-amber-500" : "text-masss-accent")}>
                      {nextBreakIsLong ? "15 min Long Break" : "5 min Short Break"}
                    </span>?
                  </p>
                </div>
                <div className="space-y-3">
                  <FocusBtn fullWidth variant="primary" onClick={handleAcceptBreak}>Accept Break</FocusBtn>
                  <FocusBtn fullWidth variant="secondary" onClick={handleSkipBreak}>Skip & Start Next</FocusBtn>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* --- RESET CONFIRM MODAL --- */}
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-[#0D1B2A]/80 backdrop-blur-sm"
          >
            <div className="max-w-xs w-full text-center p-6">
              <h2 className="text-white font-bold text-lg mb-2">Restart session?</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Current progress will be lost.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleRestart}
                  className="w-full py-3 bg-white text-[#0D1B2A] font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                >
                  Confirm Restart
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3 text-slate-500 font-medium hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- CONFLICT MODAL --- */}
        {/* FIX 1 (cont): renders the conflict warning that showConflict state now controls */}
        {/* --- CONFLICT MODAL --- */}
{showConflict && (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className="absolute inset-0 z-[60] flex items-center justify-center bg-[#0D1B2A]/80 backdrop-blur-sm"
  >
    <div className="max-w-xs w-full text-center p-6">
      <div className="flex justify-center mb-4">
        <AlertTriangle size={36} className="text-amber-400" />
      </div>
      <h2 className="text-white font-bold text-lg mb-2">Session already active</h2>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        Finish or stop your current session before starting a new one.
      </p>
      {/* Changed: dismiss now navigates back to the active task */}
      <button
        onClick={onConflictDismiss}
        className="w-full py-3 bg-white text-[#0D1B2A] font-bold rounded-xl hover:bg-slate-100 transition-colors"
      >
        Go back to active session
      </button>
    </div>
  </motion.div>
)}

      </div>
    </>
  )
}