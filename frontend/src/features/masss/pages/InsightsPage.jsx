// frontend/src/features/masss/pages/InsightsPage.jsx

import React from 'react'
import { PageWrapper, PageLoader } from '../components/layout/PageWrapper'
import { useStateVector }    from '../hooks/useStateVector'
import { useSchedule }       from '../hooks/useSchedule'
import { useTasks }          from '../hooks/useTasks'
import { useSessions }       from '../hooks/useSessions'
import { getCurrentSlot }    from '../utils/slotUtils'
import { SLOTS }             from '../components/insights/insightsUtils'
import CognitiveSnapshot     from '../components/insights/CognitiveSnapshot'
import AIRecommendations     from '../components/insights/AIRecommendations'
import FocusTrend            from '../components/insights/FocusTrend'

export default function InsightsPage() {
  const activeSlot                          = getCurrentSlot()
  const { stateVector, loading: svLoading } = useStateVector(activeSlot)
  const { rlSchedule, rlLoading }           = useSchedule(activeSlot)
  const { tasks: allTasks }                 = useTasks()
  const { sessions }                        = useSessions()

  if (svLoading) return <PageLoader />

  const energy     = stateVector?.energy_battery ?? {}
  const slotLabels = stateVector?.slot_labels    ?? {}

  const bestSlot = SLOTS.reduce((best, s) => {
    const sScore = energy[s]?.score ?? energy[s] ?? 0
    const bScore = energy[best]?.score ?? energy[best] ?? 0
    return sScore > bScore ? s : best
  }, 'morning')

  return (
    <PageWrapper>
      <div className="mb-7">
        <p className="text-[10px] text-masss-accent uppercase tracking-widest font-bold mb-1">
          ✦ AI Engine
        </p>
        <h1 className="text-2xl font-bold text-masss-heading">AI Insights</h1>
        <p className="text-sm text-masss-heading/40 mt-1">
          How the AI sees you · updated live
        </p>
      </div>

      <CognitiveSnapshot stateVector={stateVector} activeSlot={activeSlot} />

      <AIRecommendations
        rlSchedule={rlSchedule}
        rlLoading={rlLoading}
        allTasks={allTasks}
        energy={energy}
      />

      <FocusTrend
        sessions={sessions}
        bestSlot={bestSlot}
        slotLabels={slotLabels}
      />
    </PageWrapper>
  )
}