import React from 'react'
import { Outlet } from 'react-router-dom'
import { MasssProvider, useMasss } from '../../context/MasssContext'
import { MassSidebar } from './MassSidebar'
import { MassTopBar } from './MassTopBar'

const MasssLayoutInner = () => {
  const { sidebarCollapsed } = useMasss()
  return (
    <div className="flex h-screen overflow-hidden bg-masss-bg text-masss-heading">
      <MassSidebar />
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-200 ${
        sidebarCollapsed ? 'ml-[60px]' : 'ml-[220px]'
      }`}>
        <MassTopBar />
        <main className="flex-1 overflow-y-auto masss-scroll bg-masss-bg">
          <div className="p-6">
            <Outlet />
          </div>
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