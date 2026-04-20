// frontend/src/features/masss/hooks/useExams.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useExams = (moduleId) => {
  const [exams,   setExams]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchExams = useCallback(async () => {
    if (!moduleId) {
      setExams([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await massApi.get(`/exams/module/${moduleId}`)
      setExams(data.data || [])
    } catch (err) {
      console.error('[useExams] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const createExam = async (payload) => {
    const data = await massApi.post(`/exams/module/${moduleId}`, payload)
    setExams(prev => [...prev, data.data])
    return data.data
  }

  const updateExam = async (id, payload) => {
    const data = await massApi.put(`/exams/${id}`, payload)
    setExams(prev => prev.map(e => e._id === id ? data.data : e))
    return data.data
  }

  const deleteExam = async (id) => {
    await massApi.delete(`/exams/${id}`)
    setExams(prev => prev.filter(e => e._id !== id))
  }

  return {
    exams,
    loading,
    error,
    refetch:    fetchExams,
    createExam,
    updateExam,
    deleteExam,
  }
}