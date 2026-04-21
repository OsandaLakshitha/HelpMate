// frontend/src/features/masss/hooks/useTasks.js

import { useState, useEffect, useCallback } from 'react'
import massApi from '../lib/massApi'

export const useTasks = (filters = {}) => {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Build query string from filters object
  const buildQuery = (f) => {
    const params = new URLSearchParams()
    if (f.status)     params.append('status',    f.status)
    if (f.moduleId)   params.append('module_id', f.moduleId)
    if (f.examId)     params.append('exam_id',   f.examId)
    if (f.priority)   params.append('priority',  f.priority)
    if (f.difficulty) params.append('difficulty', f.difficulty)
    return params.toString() ? `?${params.toString()}` : ''
  }

  // Stringify filters so useCallback detects changes correctly
  const filtersKey = JSON.stringify(filters)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await massApi.get(`/tasks${buildQuery(filters)}`)
      setTasks(data.data || [])
    } catch (err) {
      console.error('[useTasks] fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (payload) => {
    const data = await massApi.post('/tasks', payload)
    setTasks(prev => [data.data, ...prev])
    return data.data
  }

  const updateTask = async (id, payload) => {
    const data = await massApi.patch(`/tasks/${id}`, payload)
    setTasks(prev => prev.map(t => t._id === id ? data.data : t))
    return data.data
  }

  const archiveTask = async (id) => {
    await massApi.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  return {
    tasks,
    loading,
    error,
    refetch:    fetchTasks,
    createTask,
    updateTask,
    archiveTask,
  }
}