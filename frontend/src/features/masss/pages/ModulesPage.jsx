// src/features/masss/pages/ModulesPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useModules } from '../hooks/useModules'
import { ModuleCard }         from '../components/modules/ModuleCard'
import { CreateModuleModal }  from '../components/modules/CreateModuleModal'

export default function ModulesPage() {
  const navigate = useNavigate()
  const { modules, loading, error, createModule, deleteModule, refetch } = useModules()

  const [showModal, setShowModal] = useState(false)

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this module and all its tasks?')) return
    await deleteModule(id)
  }

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <PageWrapper>
      <PageHeader
        // title="Modules"
        // subtitle={`${modules.length} subject${modules.length !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            New Module
          </button>
        }
      />

      {modules.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No modules yet"
          subtitle="Create a module to organise your study tasks"
          action={
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-masss-accent text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              Create your first module
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 m-6">
          {modules.map((mod, i) => (
            <ModuleCard
              key={mod._id}
              mod={mod}
              index={i}
              onClick={() => navigate(`/masss/modules/${mod._id}`)}
              onDelete={e => handleDelete(e, mod._id)}
            />
          ))}
        </div>
      )}

      <CreateModuleModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={createModule}
      />
    </PageWrapper>
  )
}