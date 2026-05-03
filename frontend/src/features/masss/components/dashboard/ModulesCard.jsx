// frontend/src/features/masss/components/dashboard/ModulesCard.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ArrowUpRight } from 'lucide-react'

export default function ModulesCard({ modules, onNavigate }) {
  const totalModules = modules.length
  const totalTasks   = modules.reduce((acc, m) => acc + (m.tasks?.length ?? 0), 0)
  const pendingTasks = modules.reduce(
    (acc, m) => acc + (m.tasks?.filter(t => t.status !== 'completed').length ?? 0), 0
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onClick={() => onNavigate('/masss/modules')}
      className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer hover:border-masss-accent/40 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-masss-accent" />
          <p className="text-xs font-bold text-masss-heading/50 uppercase tracking-wider">Modules</p>
        </div>
        <ArrowUpRight size={13} className="text-masss-heading/20 group-hover:text-masss-accent transition-colors" />
      </div>

      {/* Stats */}
      <div className="space-y-2">
        {[
          { value: totalModules, label: 'modules'   },
          { value: totalTasks,   label: 'tasks'      },
          { value: pendingTasks, label: 'remaining'  },
        ].map(s => (
          <div
            key={s.label}
            className="flex items-center justify-between px-3 py-2 bg-masss-bg rounded-xl border border-masss-mint"
          >
            <p className="text-[11px] text-masss-heading/50 capitalize">{s.label}</p>
            <p className="text-sm font-bold text-masss-heading">{s.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}