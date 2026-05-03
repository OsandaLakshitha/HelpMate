// src/features/masss/components/exams/examConstants.js

export const EXAM_TYPE_OPTIONS = [
  { value: 'final',        label: 'Final Exam'    },
  { value: 'midterm',      label: 'Midterm'       },
  { value: 'quiz',         label: 'Quiz'          },
  { value: 'assignment',   label: 'Assignment'    },
  { value: 'presentation', label: 'Presentation'  },
  { value: 'other',        label: 'Other'         },
]

export const EMPTY_EXAM = {
  name:      '',
  exam_type: 'quiz',
  due_date:  '',
  weight:    10,
}