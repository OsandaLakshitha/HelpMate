// frontend/src/features/masss/pages/DashboardPage.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper, PageLoader } from '../components/layout/PageWrapper'
import { useStateVector } from '../hooks/useStateVector'
import { useDashboard }   from '../hooks/useDashboard'
import { useSchedule }    from '../hooks/useSchedule'
import { useProfile }     from '../hooks/useProfile'
import { useModules }     from '../hooks/useModules'
import { getCurrentSlot } from '../utils/slotUtils'

import TodaysPlanCard   from '../components/dashboard/TodaysPlanCard'
import EnvironmentCard  from '../components/dashboard/EnvironmentCard'
import FocusStreakCard  from '../components/dashboard/FocusStreakCard'
import ModulesCard      from '../components/dashboard/ModulesCard'
import StudyProfileCard from '../components/dashboard/StudyProfileCard'

const SLOTS = ['morning', 'afternoon', 'evening']

export default function DashboardPage() {
  const navigate   = useNavigate()
  const activeSlot = getCurrentSlot()

  const { stateVector, loading: svLoading } = useStateVector(activeSlot)
  const { summary,    loading: sumLoading } = useDashboard()
  const { rlSchedule, rlLoading }           = useSchedule(activeSlot)
  const { preferences }                     = useProfile()
  const { modules }                         = useModules()

  if (svLoading || sumLoading) return <PageLoader />

  const slotLabels = stateVector?.slot_labels ?? {}
  const nextTask   = SLOTS.flatMap(s => rlSchedule?.[s] ?? []).find(Boolean)
  const nextSlot   = SLOTS.find(s => (rlSchedule?.[s] ?? []).length > 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-6 px-1">
        <p className="text-sm text-masss-heading/40">{greeting()}</p>
        <h1 className="text-2xl font-bold text-masss-heading">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </h1>
      </div>

      {/* ── Bento grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          <TodaysPlanCard
            rlSchedule={rlSchedule}
            rlLoading={rlLoading}
            activeSlot={activeSlot}
            slotLabels={slotLabels}
            preferences={preferences}
            onNavigate={navigate}
          />
          <StudyProfileCard
            preferences={preferences}
            modules={modules}
            nextTask={nextTask}
            nextSlot={nextSlot}
            slotLabels={slotLabels}
            onNavigate={navigate}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          <EnvironmentCard
            stateVector={stateVector}
            onNavigate={navigate}
          />
          <div className="grid grid-cols-2 gap-4">
            <FocusStreakCard summary={summary} />
            <ModulesCard modules={modules} onNavigate={navigate} />
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}