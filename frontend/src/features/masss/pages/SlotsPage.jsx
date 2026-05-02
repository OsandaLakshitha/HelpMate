// frontend/src/features/masss/pages/SlotsPage.jsx

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { PageLoader, PageError } from '../components/layout/PageWrapper'
import { useProfile } from '../hooks/useProfile'

const SLOT_NAMES = ['morning', 'afternoon', 'evening']

export default function SlotsPage() {
  const { preferences, loading, error, savePreference, refetch } = useProfile()
  const [localPrefs, setLocalPrefs] = useState([])
  const [saving,     setSaving]     = useState(null)
  const [saved,      setSaved]      = useState(null)

  useEffect(() => {
    if (preferences.length > 0) setLocalPrefs(preferences)
  }, [preferences])

  const update = (slotName, field, value) => {
    setLocalPrefs(prev => prev.map(p =>
      p.slot_name === slotName ? { ...p, [field]: value } : p
    ))
  }

  const handleSave = async (slotName) => {
    const pref = localPrefs.find(p => p.slot_name === slotName)
    if (!pref) return
    try {
      setSaving(slotName)
      await savePreference({
        slot_name:     pref.slot_name,
        slot_label:    pref.slot_label,
        start_time:    pref.start_time,
        end_time:      pref.end_time,
        max_pomodoros: calcMaxPomos(pref.start_time, pref.end_time) ?? pref.max_pomodoros,
        is_preferred:  pref.is_preferred,
      })
      setSaved(slotName)
      setTimeout(() => setSaved(null), 2000)
    } finally {
      setSaving(null)
    }
  }

  const calcMaxPomos = (start, end) => {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  return mins > 0 ? Math.floor(mins / 25) : null
}

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <div className="space-y-4 max-w-lg">
      {SLOT_NAMES.map((slotName, i) => {
        const pref = localPrefs.find(p => p.slot_name === slotName)
        if (!pref) return null

        return (
          <motion.div
            key={slotName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-masss-white border border-masss-mint rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-masss-mint text-masss-accent text-xs font-semibold capitalize">
                {slotName}
              </span>
              {/* <span className="text-xs text-masss-heading/40">
                Energy: {(pref.inferred_energy_score * 100).toFixed(0)}%
              </span> */}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-masss-heading/50 mb-1 block">Display label</label>
                <input
                  type="text"
                  value={pref.slot_label || ''}
                  onChange={e => update(slotName, 'slot_label', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                  placeholder="e.g. Deep Work"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-masss-heading/50 mb-1 block">Start time</label>
                  <input
                    type="time"
                    value={pref.start_time || ''}
                    onChange={e => update(slotName, 'start_time', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-masss-heading/50 mb-1 block">End time</label>
                  <input
                    type="time"
                    value={pref.end_time || ''}
                    onChange={e => update(slotName, 'end_time', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                  />
                </div>
              </div>
            <div>
  <div className="flex items-center justify-between mb-1">
    <label className="text-xs text-masss-heading/50">Max pomodoros for this slot</label>
    <span className="text-[10px] font-semibold text-masss-accent">
      Slot max {calcMaxPomos(pref.start_time, pref.end_time) ?? '—'} 🍅
    </span>
  </div>
  <input
    type="number"
    min={1}
    max={calcMaxPomos(pref.start_time, pref.end_time) ?? 12}
    value={pref.max_pomodoros || 4}
    onChange={e => {
      const max = calcMaxPomos(pref.start_time, pref.end_time)
      const val = Number(e.target.value)
      update(slotName, 'max_pomodoros', max !== null ? Math.min(val, max) : val)
    }}
    className="w-full px-3 py-2 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
  />
</div>    </div>

            <button
              onClick={() => handleSave(slotName)}
              disabled={saving === slotName}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-masss-accent text-white text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              <Save size={14} />
              {saving === slotName ? 'Saving...' : saved === slotName ? 'Saved ✓' : 'Save changes'}
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}