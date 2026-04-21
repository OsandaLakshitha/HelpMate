// frontend/src/features/masss/pages/SettingsLayout.jsx

import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { User, Layers, CalendarDays } from 'lucide-react'
import { PageWrapper, PageHeader } from '../components/layout/PageWrapper'

const TABS = [
  { to: '/masss/settings/profile', label: 'Profile',  icon: User        },
  { to: '/masss/settings/slots',   label: 'Slots',    icon: Layers      },
  { to: '/masss/settings/routine', label: 'Routine',  icon: CalendarDays },
]

export default function SettingsLayout() {
  return (
    <PageWrapper>
      <PageHeader title="Settings" subtitle="Preferences and profile" />

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-masss-white border border-masss-mint rounded-xl w-fit mb-6">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => [
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-masss-accent text-white'
                : 'text-masss-heading/60 hover:text-masss-heading',
            ].join(' ')}
          >
            <tab.icon size={14} />
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </PageWrapper>
  )
}