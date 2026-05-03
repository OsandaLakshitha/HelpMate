// src/features/masss/components/modules/ModuleStatsStrip.jsx

import React from 'react'

export const ModuleStatsStrip = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null

  const stats = [
    { label: 'Total Tasks', value: tasks.length,                                           color: 'text-masss-heading' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length,  color: 'text-masss-accent'  },
    { label: 'Completed',   value: tasks.filter(t => t.status === 'completed').length,     color: 'text-masss-accent'  },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-masss-white border border-masss-mint rounded-2xl p-4 text-center"
        >
          <p className={`font-bold text-2xl tabular-nums ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-masss-heading/40 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}