// frontend/src/features/masss/hooks/useOnboarding.js

import { useState } from 'react'
import massApi from '../lib/massApi'

export const useOnboarding = () => {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const getSlotDefaults = async (chronotype) => {
    const data = await massApi.get(`/onboarding/slot-defaults/${chronotype}`)
    return data.slots
  }

  const completeOnboarding = async (payload) => {
    try {
      setLoading(true)
      setError(null)
      const data = await massApi.post('/onboarding/complete', payload)
      return data
    } catch (err) {
      console.error('[useOnboarding] complete error:', err.message)
      setError(err.message)
      throw err  // re-throw so page can catch and show inline error
    } finally {
      setLoading(false)
    }
  }

  const skipOnboarding = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await massApi.post('/onboarding/skip')
      return data
    } catch (err) {
      console.error('[useOnboarding] skip error:', err.message)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getSlotDefaults,
    completeOnboarding,
    skipOnboarding,
  }
}