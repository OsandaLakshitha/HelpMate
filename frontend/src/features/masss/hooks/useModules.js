// frontend/src/features/masss/hooks/useModules.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useModules = () => {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await massApi.get('/modules')
      setModules(data.data || [])
    } catch (err) {
      console.error('[useModules] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const createModule = async (payload) => {
    const data = await massApi.post('/modules', payload)
    await fetchModules() // refetch to get populated tasks + exams
    return data.data
  }

  const updateModule = async (id, payload) => {
    const data = await massApi.put(`/modules/${id}`, payload)
    setModules(prev => prev.map(m => m._id === id ? data.data : m))
    return data.data
  }

  const deleteModule = async (id) => {
    await massApi.delete(`/modules/${id}`)
    setModules(prev => prev.filter(m => m._id !== id))
  }

  return {
    modules,
    loading,
    error,
    refetch:      fetchModules,
    createModule,
    updateModule,
    deleteModule,
  }
}