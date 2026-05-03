// src/features/masss/components/modules/EditModuleModal.jsx

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { CATEGORY_OPTIONS, ENERGY_TIMES, COLOURS } from './moduleConstants'

export const EditModuleModal = ({ open, module, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    name:        '',
    category:    'other',
    color:       '#0FA89E',
    energy_time: 'afternoon',
  })

  // Pre-populate form whenever the module prop changes (a different card was edited)
  useEffect(() => {
    if (module) {
      setForm({
        name:        module.name        || '',
        category:    module.category    || 'other',
        color:       module.color       || '#0FA89E',
        energy_time: module.energy_time || module.energyTime || 'afternoon',
      })
    }
  }, [module])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSave(module._id, form)
  }

  if (!open || !module) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-masss-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-masss-mint"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-masss-heading">Edit Module</h2>
            <button
              onClick={onClose}
              className="text-masss-heading/40 hover:text-masss-heading transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-masss-heading/50 mb-5">
            Update the details for this module.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                Module Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Advanced Mathematics"
                className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent placeholder:text-masss-heading/30"
                required
              />
            </div>

            {/* Category + Study Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent"
                >
                  {CATEGORY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                  Best Study Time
                </label>
                <select
                  value={form.energy_time}
                  onChange={e => setForm(p => ({ ...p, energy_time: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-masss-mint text-sm text-masss-heading bg-masss-bg focus:outline-none focus:border-masss-accent capitalize"
                >
                  {ENERGY_TIMES.map(t => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colour picker */}
            <div>
              <label className="text-xs font-semibold text-masss-heading/60 mb-1.5 block">
                Colour
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLOURS.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={[
                      'w-7 h-7 rounded-lg transition-all duration-150',
                      form.color === c
                        ? 'ring-2 ring-white/60 scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105',
                    ].join(' ')}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}