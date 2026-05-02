// frontend/src/features/masss/components/layout/MassSidebar.jsx

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarDays, BookOpen,
  CheckSquare, Timer, History, Brain, Settings,
  ChevronLeft, ChevronRight, LogOut, Sparkles,
} from 'lucide-react'
import { useMasss } from '../../context/MasssContext'
import { useAuth }  from '../../../../context/AuthContext'
import { MODE } from '../focus/constants'; //
import { cn } from '../../utils/cn';

// ── Nav item definitions ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',   to: '/masss/dashboard'   },
  { icon: CalendarDays,    label: 'Schedule',    to: '/masss/schedule'    },
  { icon: BookOpen,        label: 'Modules',     to: '/masss/modules'     },
  { icon: CheckSquare,     label: 'Tasks',       to: '/masss/tasks'       },
  { icon: Timer,           label: 'Focus',       to: '/masss/focus', highlight: true, showActive: true },
  { icon: History,         label: 'Sessions',    to: '/masss/sessions'    },
  { icon: Brain,           label: 'AI Insights', to: '/masss/ai-insights' },
  { icon: Settings,        label: 'Settings',    to: '/masss/settings'    },
]

// ── Single nav link ────────────────────────────────────────────────────────

const NavItem = ({ item, collapsed }) => {
  const { focusMode, focusActive } = useMasss()
  const isTimerActive = item.showActive && focusActive &&
    [MODE.RUNNING, MODE.PAUSED, MODE.BREAK].includes(focusMode)

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => [
        'group relative flex items-center gap-2.5 rounded-lg text-sm',
        'transition-all duration-150 cursor-pointer border',
        collapsed ? 'justify-center py-2.5 px-0' : 'justify-start py-2.5 px-3',
        isActive
          ? 'font-semibold text-masss-heading bg-masss-bg border-masss-accent'
          : 'font-normal text-masss-heading/60 bg-transparent border-transparent hover:bg-masss-bg hover:text-masss-heading',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          <item.icon size={16} className="shrink-0 text-masss-accent" />

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{   opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap flex-1"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Active session pulse dot */}
          {isTimerActive && !collapsed && (
            <span className={cn(
              'w-2 h-2 rounded-full shrink-0',
              focusMode === MODE.RUNNING ? 'bg-masss-accent animate-pulse' : 'bg-amber-400',
            )} />
          )}

          {/* Collapsed tooltip */}
          {collapsed && (
            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-masss-heading border border-masss-mint rounded-md px-2.5 py-1 text-xs text-masss-bg whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {item.label}
              {isTimerActive && ' ●'}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

// ── Sidebar bottom button (back / logout) ──────────────────────────────────
const SidebarButton = ({ icon, label, collapsed, onClick, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-2.5 rounded-lg text-sm',
        'transition-all duration-150 cursor-pointer border border-transparent',
        collapsed ? 'justify-center py-2.5 px-0' : 'justify-start py-2.5 px-3',
        danger
          ? 'text-masss-heading/50 hover:bg-red-50 hover:text-masss-danger'
          : 'text-masss-heading/50 hover:bg-masss-bg hover:text-masss-heading',
      ].join(' ')}
    >
      {icon}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
export const MassSidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useMasss()
  const { user, logout }                    = useAuth()
  const navigate                            = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Student'

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 60 : 220 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen bg-masss-white border-r border-masss-mint flex flex-col overflow-hidden z-40"
    >

      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div className={[
        'h-14 flex items-center border-b border-masss-mint shrink-0 gap-2.5',
        sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4',
      ].join(' ')}>

        {/* Logo mark */}
        <div className="w-7 h-7 bg-masss-accent rounded-lg flex items-center justify-center shrink-0">
          <span className="text-xs font-extrabold text-white">M</span>
        </div>

        {/* Logo text */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="m-0 text-base font-bold text-masss-heading whitespace-nowrap leading-tight">
                Study Scheduler
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav items ─────────────────────────────────────────────── */}
      <nav className="masss-scroll flex-1 p-2 overflow-hidden flex flex-col gap-1 mt-10 ">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* ── Bottom — user info + actions ──────────────────────────── */}
      <div className="border-t border-masss-mint p-2 shrink-0 flex flex-col gap-0.5">

        {/* User info card */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="px-3 py-2 mb-1 overflow-hidden bg-masss-bg rounded-lg border border-masss-mint"
            >
              <p className="m-0 text-xs font-semibold text-masss-heading truncate">
                {displayName}
              </p>
              <p className="m-0 text-[11px] text-masss-accent truncate">
                {user?.email || ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Helpmate */}
        <SidebarButton
          icon={<ChevronLeft size={15} />}
          label="Back to Helpmate"
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/user/dashboard')}
        />

        {/* Logout */}
        <SidebarButton
          icon={<LogOut size={15} />}
          label="Log out"
          collapsed={sidebarCollapsed}
          onClick={handleLogout}
          danger
        />
      </div>

      {/* ── Collapse toggle button ─────────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        className="
          absolute -right-[6px] top-[68px]
          w-[22px] h-[22px] rounded-md
          bg-masss-white border border-masss-mint
          flex items-center justify-center
          cursor-pointer text-masss-accent
          z-50 shrink-0
          hover:bg-masss-bg transition-colors duration-150
        "
      >
        {sidebarCollapsed
          ? <ChevronRight size={11} />
          : <ChevronLeft  size={11} />
        }
      </button>

    </motion.aside>
  )
}