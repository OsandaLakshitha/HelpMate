// frontend/src/features/masss/hooks/useStateVector.js

import { useState, useEffect, useCallback, useRef } from 'react'
import massApi from '../lib/massApi'

const POLL_INTERVAL = 8000 // 8 seconds — same cadence as original MASSS

export const useStateVector = (activeSlot = 'morning') => {
  const [stateVector, setStateVector] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const intervalRef = useRef(null)

  const fetchStateVector = useCallback(async () => {
    try {
      setError(null)
      const data = await massApi.get(`/rl/state-vector?active_slot=${activeSlot}`)
      setStateVector(data.data)
    } catch (err) {
      console.error('[useStateVector] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [activeSlot])

  useEffect(() => {
    // Fetch immediately on mount
    fetchStateVector()

    // Then poll every 8 seconds
    intervalRef.current = setInterval(fetchStateVector, POLL_INTERVAL)

    // Clean up interval on unmount — prevents memory leaks
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchStateVector])

  return { stateVector, loading, error, refetch: fetchStateVector }
}