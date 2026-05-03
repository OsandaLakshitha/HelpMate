import React from 'react'
import { motion } from 'framer-motion'

export const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`h-full overflow-y-auto px-10 pt-8 pb-5 masss-scroll ${className}`}
    >
      {children}
    </motion.div>
  )
}

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold leading-tight text-[#0D1B2A]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1 text-[#0FA89E]">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-[#C7F0EB] border-t-[#0FA89E] animate-spin" />
    </div>
  )
}

export const PageError = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-sm text-[#0D1B2A]/50">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-sm rounded-lg border border-[#C7F0EB] text-[#0FA89E] bg-transparent hover:bg-[#C7F0EB] transition-colors duration-150 cursor-pointer"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export const EmptyState = ({ icon, title, subtitle, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2">
      {icon && (
        <div className="text-3xl mb-2 text-[#C7F0EB]">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-[#0D1B2A]">
        {title}
      </p>
      {subtitle && (
        <p className="text-sm text-[#0D1B2A]/50">
          {subtitle}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}