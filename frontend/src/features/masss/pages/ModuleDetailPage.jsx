// src/features/masss/pages/ModuleDetailPage.jsx

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import { PageWrapper, PageLoader, PageError } from '../components/layout/PageWrapper'
import { useModule } from '../hooks/useModule'
import { useTasks }  from '../hooks/useTasks'
import massApi from '../lib/massApi'

import { TaskList }         from '../components/tasks/TaskList'
import { CreateTaskModal }  from '../components/tasks/CreateTaskModal'
import { ExamList }         from '../components/exams/ExamList'
import { CreateExamModal }  from '../components/exams/CreateExamModal'
import { ModuleStatsStrip } from '../components/modules/ModuleStatsStrip'

export default function ModuleDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { module, loading: mLoading, error: mError, refetch: mRefetch } = useModule(id)
  const { tasks,  loading: tLoading, createTask, archiveTask }          = useTasks({ moduleId: id })

  const [activeTab,      setActiveTab]      = useState('tasks')
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createExamOpen, setCreateExamOpen] = useState(false)
  const [submitting,     setSubmitting]     = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateTask = async (form) => {
    try {
      setSubmitting(true)
      await createTask({
        name:                form.name,
        description:         form.description || undefined,
        module_id:           id,
        priority:            form.priority,
        difficulty:          form.difficulty,
        estimated_pomodoros: form.estimated_pomodoros,
        deadline:            form.deadline ? new Date(form.deadline).toISOString() : undefined,
        exam_id:             form.exam_id || undefined,
      })
      setCreateTaskOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateExam = async (form) => {
    try {
      setSubmitting(true)
      await massApi.post(`/exams/module/${id}`, {
        name:      form.name,
        exam_type: form.exam_type,
        due_date:  form.due_date,
        weight:    form.weight,
      })
      await mRefetch()
      setCreateExamOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading / error ────────────────────────────────────────────────────────

  if (mLoading || tLoading) return <PageLoader />
  if (mError)  return <PageError message={mError} onRetry={mRefetch} />
  if (!module) return <PageError message="Module not found" />

  const color    = module.color || '#0FA89E'
  const exams    = module.exams || []
  const taskList = tasks || []

  const tabs = [
    { id: 'tasks', label: 'Tasks', count: taskList.length },
    { id: 'exams', label: 'Exams', count: exams.length   },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
 <PageWrapper className="flex flex-col overflow-hidden pb-1">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/masss/modules')}
          className="p-2 rounded-lg border border-masss-mint text-masss-heading/60 hover:bg-masss-bg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '20', border: `1px solid ${color}35` }}
        >
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: color }} />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-masss-heading truncate">{module.name}</h1>
          <p className="text-xs text-masss-heading/50 capitalize">
            {module.category?.replace('_', ' ')} · Best in {module.energyTime || module.energy_time}
          </p>
        </div>

        {activeTab === 'tasks' && (
          <button
            onClick={() => setCreateTaskOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus size={14} /> Add Task
          </button>
        )}
        {activeTab === 'exams' && (
          <button
            onClick={() => setCreateExamOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus size={14} /> Add Exam
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-masss-bg border border-masss-mint rounded-xl mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-masss-accent text-white shadow-sm'
                : 'text-masss-heading/50 hover:text-masss-heading',
            ].join(' ')}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-[10px] opacity-70">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

<div className='bg-red-400 flex-1 overflow-y-auto pr-2'>
      <AnimatePresence mode="wait">

        {/* Tasks tab */}
        {activeTab === 'tasks' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <TaskList
              tasks={taskList}
              variant="module"
              onFocus={taskId => navigate(`/masss/focus/${taskId}`)}
              onArchive={archiveTask}
              onAddClick={() => setCreateTaskOpen(true)}
            />
            <ModuleStatsStrip tasks={taskList} />
          </motion.div>
        )}

        {/* Exams tab */}
        {activeTab === 'exams' && (
          <motion.div
            key="exams"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ExamList
              exams={exams}
              onAddClick={() => setCreateExamOpen(true)}
            />
          </motion.div>
        )}

      </AnimatePresence>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {createTaskOpen && (
          <CreateTaskModal
            open={createTaskOpen}
            onClose={() => setCreateTaskOpen(false)}
            onSubmit={handleCreateTask}
            submitting={submitting}
            exams={exams}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createExamOpen && (
          <CreateExamModal
            open={createExamOpen}
            onClose={() => setCreateExamOpen(false)}
            onSubmit={handleCreateExam}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

    </PageWrapper>
  )
}