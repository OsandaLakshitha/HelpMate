// frontend/src/features/masss/components/dashboard/StudyProfileCard.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { User, ArrowUpRight } from 'lucide-react'
import { slotDefaultLabel } from '../../utils/slotUtils'

const priorityStyle = (p) =>
  p === 'high'   ? 'bg-red-50 text-red-500'     :
  p === 'medium' ? 'bg-amber-50 text-amber-500' :
                   'bg-masss-mint text-masss-accent'

export default function StudyProfileCard({
  preferences, modules, onNavigate,
  nextTask, nextSlot, slotLabels,
}) {
  const bestPref = (preferences ?? []).reduce(
    (best, p) => (p.inferred_energy_score ?? 0) > (best?.inferred_energy_score ?? 0) ? p : best,
    (preferences ?? [])[0] || null
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onClick={() => onNavigate('/masss/settings/profile')}
      className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer hover:border-masss-accent/40 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User size={14} className="text-masss-accent" />
          <p className="text-xs font-bold text-masss-heading/50 uppercase tracking-wider">Study Profile</p>
        </div>
        <ArrowUpRight size={13} className="text-masss-heading/20 group-hover:text-masss-accent transition-colors" />
      </div>


      {/* Next task */}
      {nextTask ? (
        <div className="flex items-center gap-3 p-3 bg-masss-bg rounded-xl border border-masss-accent/30">
          <div className="w-1 h-8 rounded-full bg-masss-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-masss-accent font-bold uppercase tracking-widest mb-0.5">
              Up next · {slotLabels?.[nextSlot] || slotDefaultLabel(nextSlot)}
            </p>
            <p className="text-sm font-semibold text-masss-heading truncate">
              {nextTask.task_name}
            </p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${priorityStyle(nextTask.priority)}`}>
            {nextTask.priority}
          </span>
        </div>
      ) : (
        <div className="p-3 bg-masss-bg rounded-xl border border-masss-mint text-center">
          <p className="text-[10px] text-masss-heading/40">
            No tasks scheduled — refresh the schedule
          </p>
        </div>
      )}
    </motion.div>
  )
}