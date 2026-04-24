// src/features/masss/components/exams/ExamList.jsx

import React from 'react'
import { Calendar } from 'lucide-react'
import { ExamCard } from './ExamCard'

export const ExamList = ({ exams, onAddClick }) => {
  if (!exams || exams.length === 0) {
    return (
      <div className="p-8 text-center bg-masss-white border border-masss-mint rounded-2xl">
        <Calendar size={22} className="mx-auto mb-3 text-masss-heading/20" />
        <p className="text-sm font-medium text-masss-heading/40 mb-1">No exams scheduled</p>
        <p className="text-xs text-masss-heading/30 mb-4">Add an exam using the button above.</p>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-masss-accent text-white text-sm rounded-lg hover:opacity-90"
          >
            Add Exam
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-masss-white border border-masss-mint rounded-2xl overflow-hidden divide-y divide-masss-mint">
      {exams.map(ex => (
        <ExamCard key={ex._id} exam={ex} />
      ))}
    </div>
  )
}