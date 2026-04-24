// frontend/src/features/masss/pages/FocusPage.jsx

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../utils/cn'
import { useTasks } from '../hooks/useTasks'
import { useSessions } from '../hooks/useSessions'
import { useMasss } from '../context/MasssContext'
import { SessionSidebar } from '../components/focus/SessionSidebar'
import { PomoSession }    from '../components/focus/PomoSession'
import {
  MODE,
  WORK_DURATION, SHORT_BREAK, LONG_BREAK, SESSIONS_BEFORE_LONG,
} from '../components/focus/constants'

export default function FocusPage() {
  const { taskId: urlTaskId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { tasks } = useTasks()
  const { startSession, endSession } = useSessions()

  const {
    focusMode: mode, setFocusMode: setMode,
    focusSeconds: seconds, setFocusSeconds: setSeconds,
    focusSessionId: sessionId, setFocusSessionId: setSessionId,
    focusCompleted: completed, setFocusCompleted: setCompleted,
    focusActive, setFocusActive,
    focusTaskId, setFocusTaskId,
    resetFocusTimer,
  } = useMasss()

  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // FIX 1: declared missing state — was calling setShowConflict without declaring it,
  // causing a ReferenceError crash every time handleStart ran with an active session.
  const [showConflict, setShowConflict] = useState(false)

  // --- SESSION COUNT & SCOPE LOGIC ---
  const activeTaskId = urlTaskId || focusTaskId
  const task = tasks.find(t => t._id === activeTaskId)

  const completedSessions = (task?.sessionsCount || 0) + completed
  const currentWorkSessionNum = completedSessions + 1

  const totalSessions = Math.max(
    task?.estimatedPomodoros || 0,
    currentWorkSessionNum
  )

  const isOvertime = currentWorkSessionNum > (task?.estimatedPomodoros || 0)
  const isBreakMode = mode === MODE.BREAK

  // FIX 2: off-by-one error in nextBreakIsLong.
  // handleContinue calls setCompleted(c => c + 1) before BREAK_PROMPT renders,
  // so completedSessions already reflects the just-finished session.
  // The old (completedSessions + 1) % 4 was one session ahead, meaning:
  //   session 3 triggered long break ❌, session 4 triggered short break ❌
  // Correct formula simply checks if completedSessions is a clean multiple of 4.
  // The > 0 guard prevents a false long-break trigger on first load (0 % 4 === 0).
  const nextBreakIsLong = completedSessions > 0 && completedSessions % SESSIONS_BEFORE_LONG === 0
  const breakTotal = nextBreakIsLong ? LONG_BREAK : SHORT_BREAK

  // --- TIMER EFFECT ---
  useEffect(() => {
    if (mode !== MODE.RUNNING && mode !== MODE.BREAK) return
    if (mode === MODE.RUNNING && seconds >= WORK_DURATION) {
      setMode(MODE.FEEDBACK)
    }
    if (mode === MODE.BREAK && seconds >= breakTotal) {
      setSeconds(0)
      setMode(MODE.LOBBY)
    }
  }, [seconds, mode, breakTotal, setMode, setSeconds])

  // Guard: if navigated to a different task while a session is already active,
// block the switch and show the conflict modal instead.
useEffect(() => {
  if (urlTaskId && focusActive && sessionId && urlTaskId !== focusTaskId) {
    setShowConflict(true)
  }
}, [urlTaskId, focusActive, sessionId, focusTaskId])

useEffect(() => {
  if (location.state?.conflictRedirect) {
    setShowConflict(true)
    navigate(location.pathname, { replace: true, state: null })
  }
}, [location.state, location.pathname, navigate])

  // --- ACTIONS ---

  const handleStart = async () => {
    if (focusActive && sessionId) {
      // FIX 1 (cont): now correctly calls the declared setter
      setShowConflict(true)
      return
    }
    if (starting || !activeTaskId) return
    try {
      setStarting(true)
      const s = await startSession(activeTaskId)
      setSessionId(s._id)
      setFocusTaskId(activeTaskId)
      setFocusActive(true)
      setSeconds(0)
      setMode(MODE.RUNNING)
    } catch (err) {
      console.error('[FocusPage] Start error:', err.message)
    } finally {
      setStarting(false)
    }
  }

  const handleStop = () => setMode(MODE.FEEDBACK)

  const handleRestart = async () => {
    setShowResetConfirm(false)
    if (sessionId) {
      await endSession(sessionId, { end_type: 'aborted', focus_rating: 1 })
    }
    try {
      setStarting(true)
      const s = await startSession(activeTaskId)
      setSessionId(s._id)
      setFocusTaskId(activeTaskId)
      setFocusActive(true)
      setSeconds(0)
      setMode(MODE.RUNNING)
    } catch (err) {
      console.error('[FocusPage] Restart error:', err.message)
    } finally {
      setStarting(false)
    }
  }

  // --- FEEDBACK HANDLERS ---

  const endWith = async (endType, rating, afterFn) => {
    try {
      setLoading(true)
      await endSession(sessionId, { end_type: endType, focus_rating: rating })
      afterFn()
    } catch (err) {
      console.error('[FocusPage] End error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = (rating) =>
    endWith('completed', rating, () => {
      setCompleted(c => c + 1)
      setSessionId(null)
      setSeconds(0)
      setMode(MODE.BREAK_PROMPT)
    })

  const handleCompleteTask = (rating) =>
    endWith('completed', rating, () => {
      resetFocusTimer()
      navigate('/masss/tasks')
    })

  const handleStopForNow = (rating) =>
    endWith('stopped', rating, () => {
      resetFocusTimer()
      navigate('/masss/sessions')
    })

  const handleDiscard = () =>
    endWith('aborted', 1, () => {
      setSessionId(null)
      setSeconds(0)
      setFocusActive(false)
      setMode(MODE.LOBBY)
    })

  const handleAcceptBreak = () => { setSeconds(0); setMode(MODE.BREAK) }
  const handleSkipBreak   = () => { setSeconds(0); handleStart() }

  const onConflictDismiss = () => {
  setShowConflict(false)
  navigate(`/masss/focus/${focusTaskId}`) // send them back to the active session
}

  return (
    <div className={cn(
      "h-full w-full p-4 flex box-border text-white font-sans transition-colors duration-1000 overflow-hidden",
      isBreakMode ? "bg-slate-900" : "bg-[#0D1B2A]"
    )}>

      <SessionSidebar
        totalSessions={totalSessions}
        currentSessionNum={currentWorkSessionNum}
        mode={mode}
      />

      <PomoSession
        mode={mode}
        seconds={seconds}
        task={task}
        starting={starting}
        activeTaskId={activeTaskId}
        loading={loading}
        isBreakMode={isBreakMode}
        nextBreakIsLong={nextBreakIsLong}
        breakTotal={breakTotal}
        currentWorkSessionNum={currentWorkSessionNum}
        totalSessions={totalSessions}
        isOvertime={isOvertime}
        completedSessions={completedSessions}

        showResetConfirm={showResetConfirm}
        setShowResetConfirm={setShowResetConfirm}
        showConflict={showConflict}
        setShowConflict={setShowConflict}
        onConflictDismiss={onConflictDismiss}

        handleStart={handleStart}
        handleStop={handleStop}
        handleRestart={handleRestart}
        handleContinue={handleContinue}
        handleCompleteTask={handleCompleteTask}
        handleStopForNow={handleStopForNow}
        handleDiscard={handleDiscard}
        handleAcceptBreak={handleAcceptBreak}
        handleSkipBreak={handleSkipBreak}
        setMode={setMode}

        navigate={navigate}
      />

    </div>
  )
}