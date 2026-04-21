import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import massApi from '../lib/massApi'

/**
 * MasssProtectedRoute
 *
 * Sits INSIDE Helpmate's ProtectedRoute:
 * <ProtectedRoute>            ← checks Helpmate auth (user logged in)
 * <MasssProtectedRoute>        ← checks MASSS onboarding complete
 * <MasssLayout />
 * </MasssProtectedRoute>
 * </ProtectedRoute>
 *
 * Makes its own API call — does not depend on MasssContext.
 * This means it works both inside and outside MasssLayout.
 */
const MasssProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading')
  const location = useLocation()
  const isOnboarding = location.pathname.startsWith('/masss/onboarding')

  useEffect(() => {
    massApi.get('/onboarding/status')
      .then(data => {
        setStatus(data.onboarding_completed ? 'done' : 'needed')
      })
      .catch(() => {
        // Fail open — do not block user if check fails
        setStatus('done')
      })
  }, [])

  // Loading — show MASSS-themed spinner
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F0FAF9]">
        <div className="w-7 h-7 rounded-full border-2 border-[#C7F0EB] border-t-[#0FA89E] animate-spin" />
      </div>
    )
  }

  // Onboarding not done + not already on onboarding page → redirect
  if (status === 'needed' && !isOnboarding) {
    return <Navigate to="/masss/onboarding" replace />
  }

  // Onboarding done + on onboarding page → skip to dashboard
  if (status === 'done' && isOnboarding) {
    return <Navigate to="/masss/dashboard" replace />
  }

  return children
}

export default MasssProtectedRoute