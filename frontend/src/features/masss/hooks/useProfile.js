// frontend/src/features/masss/hooks/useProfile.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useProfile = () => {
  const [preferences, setPreferences] = useState([])
  const [routine,     setRoutine]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Fetch both in parallel — same pattern as Promise.all in utils/api.js
      const [prefsData, routineData] = await Promise.all([
        massApi.get('/profile/preferences'),
        massApi.get('/profile/routine'),
      ])
      setPreferences(prefsData.data  || [])
      setRoutine(routineData.data    || [])
    } catch (err) {
      console.error('[useProfile] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const savePreference = async (payload) => {
    const data = await massApi.post('/profile/preferences', payload)
    setPreferences(prev => {
      const idx = prev.findIndex(p => p.slot_name === payload.slot_name)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx]  = data.data
        return updated
      }
      return [...prev, data.data]
    })
    return data.data
  }

  const addRoutineEvent = async (payload) => {
    const data = await massApi.post('/profile/routine', payload)
    // API returns array (one per day), spread all into state
    setRoutine(prev => [...prev, ...(data.data || [])])
    return data.data
  }

  const deleteRoutineEvent = async (eventId) => {
    await massApi.delete(`/profile/routine/${eventId}`)
    setRoutine(prev => prev.filter(e => e.id !== eventId))
  }

  const updateRoutineEvent = async (eventId, payload) => {
    const data = await massApi.put(`/profile/routine/${eventId}`, payload)
    setRoutine(prev => prev.map(e => e.id === eventId ? data.data : e))
    return data.data
  }

  return {
    preferences,
    routine,
    loading,
    error,
    refetch:            fetchAll,
    savePreference,
    addRoutineEvent,
    deleteRoutineEvent,
    updateRoutineEvent,
  }
}