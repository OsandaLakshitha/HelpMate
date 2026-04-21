// frontend/src/features/masss/hooks/useSchedule.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useSchedule = (activeSlot = 'morning') => {
  const [rlSchedule,        setRlSchedule]        = useState(null)
  const [heuristicSchedule, setHeuristicSchedule] = useState(null)
  const [rlLoading,         setRlLoading]         = useState(false)
  const [heuristicLoading,  setHeuristicLoading]  = useState(false)
  const [rlError,           setRlError]           = useState(null)

  const fetchRlSchedule = useCallback(async () => {
    try {
      setRlLoading(true)
      setRlError(null)
      const data = await massApi.get(`/schedule/rl?active_slot=${activeSlot}`)
      setRlSchedule(data.data)
    } catch (err) {
      console.error('[useSchedule] RL error:', err.message)
      setRlError(err.message)
    } finally {
      setRlLoading(false)
    }
  }, [activeSlot])

  const fetchHeuristicSchedule = useCallback(async () => {
    try {
      setHeuristicLoading(true)
      const data = await massApi.get('/schedule/heuristic')
      setHeuristicSchedule(data.data)
    } catch (err) {
      console.error('[useSchedule] heuristic error:', err.message)
    } finally {
      setHeuristicLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRlSchedule()
    fetchHeuristicSchedule()
  }, [fetchRlSchedule, fetchHeuristicSchedule])

  return {
    rlSchedule,
    heuristicSchedule,
    rlLoading,
    heuristicLoading,
    rlError,
    refetchRl:        fetchRlSchedule,
    refetchHeuristic: fetchHeuristicSchedule,
  }
}