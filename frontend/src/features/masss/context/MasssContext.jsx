// frontend/src/features/masss/context/MasssContext.jsx

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import massApi from '../lib/massApi'
import { MODE, WORK_DURATION, SHORT_BREAK, LONG_BREAK, SESSIONS_BEFORE_LONG } from '../components/focus/constants'

const MasssContext = createContext()

export const useMasss = () => {
  const context = useContext(MasssContext)
  if (!context) throw new Error('useMasss must be used within a MasssProvider')
  return context
}

export const MasssProvider = ({ children }) => {
  // ── Sidebar ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ── Onboarding ──
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [onboardingLoading, setOnboardingLoading] = useState(true)

  // ── Dashboard ──
  const [dashboardSummary, setDashboardSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(null)

  // ── Focus Timer Shared State with LocalStorage Persistence ──
  const [focusMode, setFocusMode] = useState(() =>
    localStorage.getItem('masss_mode') || MODE.LOBBY
  )
  const [focusSeconds, setFocusSeconds] = useState(() =>
    Number(localStorage.getItem('masss_seconds')) || 0
  )
  const [focusActive, setFocusActive] = useState(() =>
    localStorage.getItem('masss_active') === 'true'
  )
  const [focusTaskId, setFocusTaskId] = useState(() =>
    localStorage.getItem('masss_taskId') || null
  )
  const [focusSessionId, setFocusSessionId] = useState(() =>
    localStorage.getItem('masss_sessionId') || null
  )
  const [focusCompleted, setFocusCompleted] = useState(() =>
    Number(localStorage.getItem('masss_completed')) || 0
  )
  const [focusTaskName, setFocusTaskName] = useState(() =>
    localStorage.getItem('masss_taskName') || ''
  )

  const timerRef = useRef(null)

  // ── Persistence Logic: Save to LocalStorage ──
  useEffect(() => {
    localStorage.setItem('masss_mode',      focusMode)
    localStorage.setItem('masss_seconds',   focusSeconds)
    localStorage.setItem('masss_active',    focusActive)
    localStorage.setItem('masss_completed', focusCompleted)

    if (focusTaskId)   localStorage.setItem('masss_taskId',   focusTaskId)
    else               localStorage.removeItem('masss_taskId')

    if (focusSessionId) localStorage.setItem('masss_sessionId', focusSessionId)
    else                localStorage.removeItem('masss_sessionId')

    if (focusTaskName) localStorage.setItem('masss_taskName', focusTaskName)
    else               localStorage.removeItem('masss_taskName')
  }, [focusMode, focusSeconds, focusActive, focusTaskId, focusSessionId, focusCompleted, focusTaskName])

  // ── Timer Tick ──
  useEffect(() => {
    if ((focusMode === MODE.RUNNING || focusMode === MODE.BREAK) && focusActive) {
      timerRef.current = setInterval(() => {
        setFocusSeconds(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [focusMode, focusActive])

  // ── Notification Permission ──
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // ── Notification Helper ──
  const fireNotification = (title, body) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const n = new Notification(title, {
      body,

      tag:  'masss-session',
    })
    n.onclick = () => {
      window.focus()
      if (focusTaskId) window.location.href = `/masss/focus/${focusTaskId}`
      n.close()
    }
  }

  // ── Timer Overflow Check (global — works on any page) ──
  useEffect(() => {
    if (focusMode !== MODE.RUNNING && focusMode !== MODE.BREAK) return

    const nextBreakIsLong = focusCompleted > 0 && focusCompleted % SESSIONS_BEFORE_LONG === 0
    const breakTotal = nextBreakIsLong ? LONG_BREAK : SHORT_BREAK

    if (focusMode === MODE.RUNNING && focusSeconds >= WORK_DURATION) {
      setFocusMode(MODE.FEEDBACK)
      fireNotification(
        '🎉 Session complete!',
        `Great work on "${focusTaskName || 'your task'}". How was your focus?`
      )
    }

    if (focusMode === MODE.BREAK && focusSeconds >= breakTotal) {
      setFocusSeconds(0)
      setFocusMode(MODE.LOBBY)
      fireNotification(
        '⏰ Break over!',
        'Time to get back to work. Click to resume your session.'
      )
    }
  }, [focusSeconds, focusMode])

  // ── Onboarding Logic ──
  const checkOnboarding = async () => {
    try {
      setOnboardingLoading(true)
      const data = await massApi.get('/onboarding/status')
      setOnboardingCompleted(data.onboarding_completed)
    } catch (error) {
      setOnboardingCompleted(false)
    } finally {
      setOnboardingLoading(false)
    }
  }

  useEffect(() => { checkOnboarding() }, [])

  // ── Helpers ──
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)

  const resetFocusTimer = () => {
    localStorage.removeItem('masss_mode')
    localStorage.removeItem('masss_seconds')
    localStorage.removeItem('masss_active')
    localStorage.removeItem('masss_taskId')
    localStorage.removeItem('masss_sessionId')
    localStorage.removeItem('masss_completed')
    localStorage.removeItem('masss_taskName')

    setFocusMode(MODE.LOBBY)
    setFocusSeconds(0)
    setFocusActive(false)
    setFocusTaskId(null)
    setFocusSessionId(null)
    setFocusCompleted(0)
    setFocusTaskName('')
  }

  const value = {
    sidebarCollapsed,
    toggleSidebar,
    onboardingCompleted,
    onboardingLoading,
    setOnboardingCompleted,
    dashboardSummary,
    summaryLoading,
    summaryError,
    focusMode,      setFocusMode,
    focusSeconds,   setFocusSeconds,
    focusActive,    setFocusActive,
    focusTaskId,    setFocusTaskId,
    focusSessionId, setFocusSessionId,
    focusCompleted, setFocusCompleted,
    focusTaskName,  setFocusTaskName,
    resetFocusTimer,
  
  }





  return (
    <MasssContext.Provider value={value}>
      {children}
    </MasssContext.Provider>
  )
}