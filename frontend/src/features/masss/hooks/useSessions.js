// frontend/src/features/masss/hooks/useSessions.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useSessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await massApi.get('/sessions?limit=50')
      setSessions(data.data || [])
    } catch (err) {
      console.error('[useSessions] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const startSession = async (taskId) => {
    const data = await massApi.post('/sessions/start', { task_id: taskId })
    setSessions(prev => [data.data, ...prev])
    return data.data
  }

  const endSession = async (sessionId, payload) => {
    // payload: { end_type: 'completed'|'stopped'|'aborted', focus_rating: 1-5 }
    const data = await massApi.post(`/sessions/${sessionId}/end`, payload)
    setSessions(prev => prev.map(s => s._id === sessionId ? data.data : s))
    return data.data
  }

  return {
    sessions,
    loading,
    error,
    refetch:      fetchSessions,
    startSession,
    endSession,
  }
}