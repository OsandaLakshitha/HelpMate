// frontend/src/features/masss/components/insights/insightsAtoms.jsx
// Shared UI atoms — React components only

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

export const SectionHeader = ({ number, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-4">
    <span className="w-6 h-6 rounded-full bg-masss-accent text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
      {number}
    </span>
    <div>
      <h2 className="text-base font-bold text-masss-heading">{title}</h2>
      <p className="text-xs text-masss-heading/40 mt-0.5">{subtitle}</p>
    </div>
  </div>
)

export const Tag = ({ children, colour }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
    style={{ background: colour + '18', color: colour }}
  >
    {children}
  </span>
)

export const Bar = ({ pct, colour, delay = 0, height = 'h-2' }) => (
  <div className={`${height} bg-masss-mint rounded-full overflow-hidden`}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: colour }}
      initial={{ width: 0 }}
      animate={{ width: pct }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    />
  </div>
)

export const Collapse = ({ label = 'How does the AI know this?', children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 pt-4 border-t border-masss-mint">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[10px] text-masss-heading/40 hover:text-masss-accent transition-colors"
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-2 text-[10px] text-masss-heading/50 leading-relaxed">{children}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}