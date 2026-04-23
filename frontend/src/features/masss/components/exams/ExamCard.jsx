// src/features/masss/components/exams/ExamCard.jsx

import React from 'react'
import { Calendar, CheckCircle } from 'lucide-react'
import { deadlineLabel } from '../../utils/formatters'
import { daysUntilFromDate } from '../tasks/taskConstants'

export const ExamCard = ({ exam }) => {
  // Support both MongoDB camelCase (dueDate) and snake_case (due_date)
  const due      = exam.dueDate || exam.due_date
  const daysLeft = daysUntilFromDate(due)

  const dueDateColour =
    daysLeft === null ? 'text-masss-heading/40' :
    daysLeft <= 3     ? 'text-red-500'          :
    daysLeft <= 7     ? 'text-amber-500'        :
    'text-masss-heading/40'

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-masss-heading truncate">{exam.name}</p>
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
          <p className={`text-xs mt-0.5 flex items-center gap-1 ${dueDateColour}`}>
            <Calendar size={10} />
            {deadlineLabel(due)}
          </p>
        )}
      </div>

      {(exam.isCompleted || exam.is_completed) && (
        <CheckCircle size={15} className="text-masss-accent shrink-0" />
      )}
    </div>
  )
}