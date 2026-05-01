// src/features/masss/components/tasks/TaskList.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Archive } from 'lucide-react'
import { TaskRow } from './TaskRow'

export const TaskList = ({
  tasks,
  onFocus,
  onComplete,
  onArchive,
  onEdit,
  getModuleName,
  onAddClick,
  emptyTitle    = 'No tasks yet',
  emptySubtitle = 'Add your first task.',
  exams = [],
}) => {

  // const activeTasks   = (tasks || []).filter(t => t.status !== 'archived')
  // const archivedTasks = (tasks || []).filter(t => t.status === 'archived')
  const activeTasks     = (tasks || []).filter(t => t.status !== 'archived' && t.status !== 'completed')
const archivedTasks   = (tasks || []).filter(t => t.status === 'archived')
const completedTasks  = (tasks || []).filter(t => t.status === 'completed')
const [showCompleted, setShowCompleted] = React.useState(false)

const getExamName = (task) => {
  if (!exams.length) return null
  const examId = task.examId?._id || task.examId || task.exam_id?._id || task.exam_id
  if (!examId) return null
  const exam = exams.find(e => e._id === examId)
  console.log('Finding exam name for task', task._id, 'examId:', examId, 'found exam:', exam)
  return exam?.name || null
}

  // ── Full empty state (no tasks at all) ──────────────────────────────────────
 if (activeTasks.length === 0 && archivedTasks.length === 0 && completedTasks.length === 0) {
    return (
      <div className="p-8 text-center bg-masss-white border border-masss-mint rounded-2xl">
        <CheckCircle size={22} className="mx-auto mb-3 text-masss-heading/20" />
        <p className="text-sm font-medium text-masss-heading/40 mb-1">{emptyTitle}</p>
        <p className="text-xs text-masss-heading/30 mb-4">{emptySubtitle}</p>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-masss-accent text-white text-sm rounded-lg hover:opacity-90"
          >
            Add Task
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 pb-20" >

      {/* ── Active tasks ────────────────────────────────────────────────────── */}
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          {activeTasks.map((task, i) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <TaskRow
                task={task}
                onFocus={onFocus}
                onComplete={onComplete}
                onArchive={onArchive}
                onEdit={onEdit}
                moduleName={getModuleName ? getModuleName(task.moduleId) : null}
                examName={getExamName(task)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Archived tasks section ───────────────────────────────────────────── */}
      {archivedTasks.length > 0 && (
        <div>
          {/* Section label */}
          <div className="flex items-center gap-2 mb-3">
            <Archive size={12} className="text-masss-heading/30" />
            <span className="text-xs font-semibold text-masss-heading/30 uppercase tracking-wider">
              Deleted ({archivedTasks.length})
            </span>
            <div className="flex-1 h-px bg-masss-mint" />
          </div>

          {/* Faded archived rows */}
          <div className="space-y-2 opacity-50">
            {archivedTasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <div className="flex items-center gap-4 px-4 py-3 bg-masss-white border border-masss-mint rounded-xl">
                    <input
    type="checkbox"
    checked={true}
    readOnly
    className="w-4 h-4 shrink-0 rounded accent-masss-accent cursor-default"
  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-masss-heading/50 line-through truncate">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-masss-heading/30 capitalize">{task.priority}</span>
                      <span className="text-xs text-masss-heading/30">
                        Sessions {task.sessionsCount || 0}
                      </span>
                      {getModuleName?.(task.moduleId) && (
                        <span className="text-xs text-masss-heading/30">
                          · {getModuleName(task.moduleId)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {/* ── Completed tasks section ───────────────────────────────────────── */}
  
    
          <div className="mt-4">
        <button
          onClick={() => setShowCompleted(v => !v)}
          className="flex items-center gap-2 mb-3 w-full group"
        >
          <span className="text-xs font-semibold text-masss-heading/30 uppercase tracking-wider">
            Completed ({completedTasks.length})
          </span>
          <div className="flex-1 h-px bg-masss-mint" />
          <span className="text-[10px] text-masss-heading/30 ml-1">{showCompleted ? '▲' : '▼'}</span>
        </button>
        {showCompleted && completedTasks.length > 0 && (
          <div className="space-y-2 opacity-60">
            {completedTasks.map((task, i) => (
              <motion.div key={task._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <TaskRow
  task={task}
  onFocus={onFocus}
  onComplete={onComplete}
  onArchive={onArchive}
  onEdit={onEdit}
  moduleName={getModuleName ? getModuleName(task.moduleId) : null}
  examName={getExamName(task)}
/>
              </motion.div>
            ))}
         </div>
        )}
      </div>
    </div>
  )
}