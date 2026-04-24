// frontend/src/features/masss/components/layout/MasssLayout.jsx

import React from 'react'
import { Outlet } from 'react-router-dom'
import { MasssProvider, useMasss } from '../../context/MasssContext'
import { MassSidebar } from './MassSidebar'
import { MassTopBar } from './MassTopBar'

const MasssLayoutInner = () => {
  // Pull the state from context
  const { sidebarCollapsed, focusActive } = useMasss()

  return (
    <div className="flex h-screen overflow-hidden bg-masss-bg text-masss-heading">

      {/* Sidebar — always visible */}
      <MassSidebar />

      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-200"
        style={{ marginLeft: '220px' }} // Adjusted to typical sidebar widths
      >
        {/* Hide TopBar if focus is active to match your "Pure" focus requirement */}
 <MassTopBar />

        {/* <main className="flex-1  masss-scroll bg-masss-bg m-10"> */}
<main className="flex-1 min-h-0 overflow-hidden bg-masss-bg">
  <Outlet />
</main>
      </div>
    </div>
  )
}

export const MasssLayout = () => (
  <MasssProvider>
    <MasssLayoutInner />
  </MasssProvider>
)