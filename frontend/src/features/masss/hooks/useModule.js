// frontend/src/features/masss/hooks/useModule.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useModule = (moduleId) => {
  const [module,  setModule]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchModule = useCallback(async () => {
    if (!moduleId) return
    try {
      setLoading(true)
      setError(null)
      const data = await massApi.get(`/modules/${moduleId}`)
      setModule(data.data)
    } catch (err) {
      console.error('[useModule] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  useEffect(() => {
    fetchModule()
  }, [fetchModule])

  return { module, loading, error, refetch: fetchModule }
}