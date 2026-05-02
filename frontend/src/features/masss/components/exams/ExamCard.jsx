// src/features/masss/components/exams/ExamCard.jsx

import React, { useState, useRef, useEffect } from 'react'
import { Calendar, CheckCircle, MoreHorizontal, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { deadlineLabel } from '../../utils/formatters'
import { daysUntilFromDate } from '../tasks/taskConstants'

export const ExamCard = ({ exam, onEdit, onDelete, menuOpen, onMenuToggle }) => {
  // Support both MongoDB camelCase (dueDate) and snake_case (due_date)
  const due      = exam.dueDate || exam.due_date
const daysLeft = daysUntilFromDate(due)
const dueDateColour = daysLeft === null
  ? 'text-masss-heading/40'
  : daysLeft < 0
    ? 'text-red-500'
    : daysLeft <= 2
      ? 'text-orange-500'
      : 'text-masss-heading/40'
const [confirmOpen, setConfirmOpen] = useState(false)
  
  

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 bg-masss-white border border-masss-mint rounded-xl hover:border-masss-accent/40 transition-colors">

      {/* Left: name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold text-masss-heading truncate">{exam.name}</p>
          {(exam.examType || exam.exam_type) && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-masss-mint text-masss-accent capitalize">
              {(exam.examType || exam.exam_type).replace('_', ' ')}
            </span>
          )}
          {exam.weight && (
            <span className="text-[10px] text-masss-heading/40 font-medium">{exam.weight}%</span>
          )}
        </div>
        {due && (
          <p className={`text-xs flex items-center gap-1 ${dueDateColour}`}>
            <Calendar size={10} />
            {deadlineLabel(due)}
          </p>
        )}
      </div>

      {/* Right: completed badge + three-dot menu */}
      <div className="flex items-center gap-2 shrink-0">

        {(exam.isCompleted || exam.is_completed) && (
          <CheckCircle size={15} className="text-masss-accent" />
        )}

        <div className="relative">
  <button
onClick={() => onMenuToggle?.(exam._id)}
            className="p-1.5 rounded-lg text-masss-heading/30 hover:text-masss-heading hover:bg-masss-bg transition-all"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-masss-white border border-masss-mint rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => { onEdit?.(exam); onMenuToggle?.(null) }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-masss-heading hover:bg-masss-bg transition-colors"
              >
                <Pencil size={13} className="text-masss-heading/40" />
                Edit
              </button>
              <div className="h-px bg-masss-mint mx-2" />
              <button
               onClick={() => { setConfirmOpen(true); onMenuToggle?.(null) }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          )}

          {confirmOpen && (
            <div
              className="fixed inset-0 bg-masss-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setConfirmOpen(false)}
            >
              <div
                className="bg-masss-white border border-masss-mint rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={22} className="text-red-500" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-masss-heading mb-1">
                  Delete "{exam.name}"?
                </h3>
                <p className="text-xs text-masss-heading/50 mb-6 leading-relaxed">
                  This exam will be permanently removed from this module.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-masss-mint text-masss-heading/60 text-sm font-medium hover:bg-masss-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDelete?.(exam._id); setConfirmOpen(false) }}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}