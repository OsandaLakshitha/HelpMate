// frontend/src/features/masss/context/MasssContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

const MasssContext = createContext()

/**
 * useMasss — mirrors how Helpmate exposes useAuth()
 * Call this in any MASSS page or component to access shared state.
 *
 * Usage:
 *   const { sidebarCollapsed, toggleSidebar } = useMasss()
 */
export const useMasss = () => {
  const context = useContext(MasssContext)
  if (!context) {
    throw new Error('useMasss must be used within a MasssProvider')
  }
  return context
}

export const MasssProvider = ({ children }) => {

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ── Onboarding ────────────────────────────────────────────────────────────
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [onboardingLoading,   setOnboardingLoading]   = useState(true)

  // ── Dashboard summary ─────────────────────────────────────────────────────
  const [dashboardSummary, setDashboardSummary] = useState(null)
  const [summaryLoading,   setSummaryLoading]   = useState(false)
  const [summaryError,     setSummaryError]     = useState(null)

  // ── Focus timer (shared across layout so timer survives page navigation) ──
  const [activeSession, setActiveSession] = useState(null)
  const [focusPhase,    setFocusPhase]    = useState('idle')
  // phases: 'idle' | 'lobby' | 'working' | 'paused' | 'rating' | 'break'
  const [elapsed,       setElapsed]       = useState(0)

  // ── Check onboarding on mount ─────────────────────────────────────────────
  useEffect(() => {
    checkOnboarding()
  }, [])

  const checkOnboarding = async () => {
    try {
      setOnboardingLoading(true)
      const data = await massApi.get('/onboarding/status')
      setOnboardingCompleted(data.onboarding_completed)
    } catch (error) {
      console.error('[MasssContext] onboarding check error:', error.message)
      // Fail open — do not block the user if the check fails
      setOnboardingCompleted(false)
    } finally {
      setOnboardingLoading(false)
    }
  }

  // ── Dashboard summary ─────────────────────────────────────────────────────
  const fetchDashboardSummary = useCallback(async () => {
    try {
      setSummaryLoading(true)
      setSummaryError(null)
      const data = await massApi.get('/stats/dashboard-summary')
      setDashboardSummary(data.data)
    } catch (error) {
      console.error('[MasssContext] dashboard summary error:', error.message)
      setSummaryError(error.message)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  // ── Sidebar helpers ───────────────────────────────────────────────────────
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)

  // ── Focus timer helpers ───────────────────────────────────────────────────
  const resetFocus = () => {
    setActiveSession(null)
    setFocusPhase('idle')
    setElapsed(0)
  }

  // ── Expose everything ─────────────────────────────────────────────────────
  const value = {
    // Sidebar
    sidebarCollapsed,
    toggleSidebar,

    // Onboarding
    onboardingCompleted,
    onboardingLoading,
    checkOnboarding,
    setOnboardingCompleted,

    // Dashboard
    dashboardSummary,
    summaryLoading,
    summaryError,
    fetchDashboardSummary,

    // Focus timer
    activeSession,
    setActiveSession,
    focusPhase,
    setFocusPhase,
    elapsed,
    setElapsed,
    resetFocus,
  }

  return (
    <MasssContext.Provider value={value}>
      {children}
    </MasssContext.Provider>
  )
}