// src/features/masss/pages/ModulesPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen } from 'lucide-react'
import { PageWrapper, PageHeader, PageLoader, PageError, EmptyState } from '../components/layout/PageWrapper'
import { useModules } from '../hooks/useModules'
import { ModuleCard }        from '../components/modules/ModuleCard'
import { CreateModuleModal } from '../components/modules/CreateModuleModal'
import { EditModuleModal }   from '../components/modules/EditModuleModal'

export default function ModulesPage() {
  const navigate = useNavigate()
  const { modules, loading, error, createModule, updateModule, deleteModule, refetch } = useModules()

  const [createOpen,    setCreateOpen]    = useState(false)
  const [editingModule, setEditingModule] = useState(null)  // holds the module being edited
  const [saving,        setSaving]        = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Called by ModuleCard when Edit is selected from the menu
  const handleEdit = (mod) => {
    setEditingModule(mod)
  }

  // Called by EditModuleModal on form submit
  const handleSave = async (id, payload) => {
    try {
      setSaving(true)
      await updateModule(id, payload)
      setEditingModule(null)
    } finally {
      setSaving(false)
    }
  }

  // Called by ModuleCard after the user confirms delete in the dialog
  const handleDelete = async (id) => {
    await deleteModule(id)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <PageLoader />
  if (error)   return <PageError message={error} onRetry={refetch} />

  return (
    <PageWrapper>
      <PageHeader
        title="Modules"
        subtitle={`${modules.length} subject${modules.length !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={() => setCreateOpen(true)}
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
              onClick={() => setCreateOpen(true)}
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <CreateModuleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createModule}
      />

      {/* Edit modal — only mounts when a module is selected for editing */}
      <EditModuleModal
        open={!!editingModule}
        module={editingModule}
        onClose={() => setEditingModule(null)}
        onSave={handleSave}
        saving={saving}
      />
    </PageWrapper>
  )
}