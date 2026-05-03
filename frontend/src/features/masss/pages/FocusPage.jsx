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
import StudyProfileCard from '../components/dashboard/StudyProfileCard'
import FocusStreakCard  from '../components/dashboard/FocusStreakCard'

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

  return (
    <PageWrapper>
      {/* Date header */}
      <div className="mb-6 px-1">
        <p className="text-[10px] text-masss-accent uppercase tracking-widest font-bold mb-0.5">
          ✦ MASSS
        </p>
        <h1 className="text-2xl font-bold text-masss-heading">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Card 1 — Today's Plan (wide) */}
        <TodaysPlanCard
          rlSchedule={rlSchedule}
          rlLoading={rlLoading}
          activeSlot={activeSlot}
          slotLabels={slotLabels}
          onNavigate={navigate}
        />

        {/* Card 2 — AI Environment Signals */}
        <EnvironmentCard
          stateVector={stateVector}
          onNavigate={navigate}
        />

        {/* Card 3 — Study Profile */}
        <StudyProfileCard
          preferences={preferences}
          modules={modules}
          onNavigate={navigate}
        />

        {/* Card 4 — Focus Streak (wide) */}
        <FocusStreakCard
          summary={summary}
        />

      </div>
    </PageWrapper>
  )
}