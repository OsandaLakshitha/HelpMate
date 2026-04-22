// frontend/src/features/masss/context/MasssContext.jsx

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import massApi from '../lib/massApi'
import { MODE } from '../components/focus/constants'

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

  const timerRef = useRef(null)

  // ── Persistence Logic: Save to LocalStorage ──
  useEffect(() => {
    localStorage.setItem('masss_mode', focusMode)
    localStorage.setItem('masss_seconds', focusSeconds)
    localStorage.setItem('masss_active', focusActive)
    localStorage.setItem('masss_completed', focusCompleted)

    if (focusTaskId) localStorage.setItem('masss_taskId', focusTaskId)
    else localStorage.removeItem('masss_taskId')

    if (focusSessionId) localStorage.setItem('masss_sessionId', focusSessionId)
    else localStorage.removeItem('masss_sessionId')
  }, [focusMode, focusSeconds, focusActive, focusTaskId, focusSessionId, focusCompleted])

  // ── Timer Logic ──
  // FIX 4 (confirmed correct): the interval only runs when mode is RUNNING or BREAK,
  // and focusActive is true. When the user pauses (mode → MODE.PAUSED), this effect
  // re-runs, falls into the else branch, and clears the interval immediately.
  // The timer correctly stops on pause without any additional changes needed.
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

  // FIX 5 (confirmed correct): resetFocusTimer clears ALL focus state including
  // focusActive → false. Called by handleCompleteTask and handleStopForNow in
  // FocusPage, so focusActive is never left stale as true after a session ends.
  const resetFocusTimer = () => {
    // Clear Local Storage
    localStorage.removeItem('masss_mode')
    localStorage.removeItem('masss_seconds')
    localStorage.removeItem('masss_active')
    localStorage.removeItem('masss_taskId')
    localStorage.removeItem('masss_sessionId')
    localStorage.removeItem('masss_completed')

    // Clear State
    setFocusMode(MODE.LOBBY)
    setFocusSeconds(0)
    setFocusActive(false)
    setFocusTaskId(null)
    setFocusSessionId(null)
    setFocusCompleted(0)
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
    focusMode, setFocusMode,
    focusSeconds, setFocusSeconds,
    focusActive, setFocusActive,
    focusTaskId, setFocusTaskId,
    focusSessionId, setFocusSessionId,
    focusCompleted, setFocusCompleted,
    resetFocusTimer,
  }

  return (
    <MasssContext.Provider value={value}>
      {children}
    </MasssContext.Provider>
  )
}