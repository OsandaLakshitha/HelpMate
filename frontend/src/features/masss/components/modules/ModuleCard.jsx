// src/features/masss/components/modules/ModuleCard.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, ChevronRight, Calendar } from 'lucide-react'
import { getCategoryLabel } from './moduleConstants'

export const ModuleCard = ({ mod, index, onClick, onDelete }) => {
  const tasks      = mod.tasks || []
  const doneTasks  = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const totalTasks = tasks.length
  const progress   = totalTasks > 0 ? doneTasks / totalTasks : 0
  const color      = mod.color || '#0FA89E'
  const examCount  = (mod.exams || []).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-masss-white border border-masss-mint rounded-2xl p-5 cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '20', border: `1px solid ${color}35` }}
        >
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: color }} />
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-masss-heading/30 hover:text-red-500 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Name + category */}
      <h3 className="font-semibold text-masss-heading mb-0.5 truncate">{mod.name}</h3>
      <p className="text-xs text-masss-heading/50 mb-4">{getCategoryLabel(mod.category)}</p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-masss-heading/50">{doneTasks}/{totalTasks} tasks</span>
          <span className="font-medium" style={{ color }}>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1.5 bg-masss-mint rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-masss-heading/40">
        <div className="flex items-center gap-2.5">
          {inProgress > 0 && (
            <span className="flex items-center gap-1 text-masss-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-masss-accent animate-pulse" />
              {inProgress} active
            </span>
          )}
          {examCount > 0 && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {examCount} exam{examCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="capitalize">{mod.energyTime || mod.energy_time}</span>
          <ChevronRight
            size={12}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color }}
          />
        </div>
      </div>
    </motion.div>
  )
}