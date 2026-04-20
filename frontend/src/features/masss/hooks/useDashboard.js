// frontend/src/features/masss/hooks/useDashboard.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useDashboard = () => {
  const [summary, setsummary] = useState(null)
  const [health,  setHealth]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [summaryData, healthData] = await Promise.all([
        massApi.get('/stats/dashboard-summary'),
        massApi.get('/stats/health'),
      ])
      setSummary(summaryData.data)
      setHealth(healthData)
    } catch (err) {
      console.error('[useDashboard] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return {
    summary,
    health,
    loading,
    error,
    refetch: fetchSummary,
  }
}