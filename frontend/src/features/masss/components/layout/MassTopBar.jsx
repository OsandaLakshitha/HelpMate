import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'

const PAGE_META = {
  '/masss/dashboard':   { title: 'Dashboard',   subtitle: 'Your study overview'      },
  '/masss/schedule':    { title: 'Schedule',    subtitle: 'AI-powered daily plan'    },
  '/masss/modules':     { title: 'Modules',     subtitle: 'Your study modules'       },
  '/masss/tasks':       { title: 'Tasks',       subtitle: 'All tasks across modules' },
  '/masss/focus':       { title: 'Focus',       subtitle: 'Pomodoro work session'    },
  '/masss/sessions':    { title: 'Sessions',    subtitle: 'Your study history'       },
  '/masss/ai-insights': { title: 'AI Insights', subtitle: 'Cognitive analytics'      },
  '/masss/settings':    { title: 'Settings',    subtitle: 'Preferences and profile'  },
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const MassTopBar = () => {
  const { pathname } = useLocation()
  const { user }     = useAuth()

  const matchedKey = Object.keys(PAGE_META)
    .filter(k  => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]

  const { title, subtitle } = PAGE_META[matchedKey] || { title: 'MASSS', subtitle: '' }

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-masss-white border-b border-masss-mint">

      <div className="flex flex-col">
        <h2 className="m-0 text-base font-bold text-masss-heading leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-masss-accent leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-3.5 py-1 bg-masss-mint rounded-full">
        <span className="text-xs text-masss-accent">
          {getGreeting()},
        </span>
        <span className="text-xs text-masss-heading font-semibold">
          {user?.firstName || 'Student'}
        </span>
      </div>

    </header>
  )
}