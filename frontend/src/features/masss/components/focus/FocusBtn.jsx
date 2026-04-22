// frontend/src/features/masss/components/focus/FocusBtn.jsx

import React from 'react'
import { cn } from '../../utils/cn'

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
  xl: 'px-10 py-5 text-lg',
}

const VARIANTS = {
  primary:   'bg-masss-accent text-white hover:opacity-90',
  secondary: 'bg-masss-bg border border-masss-mint text-masss-heading hover:bg-masss-mint',
  ghost:     'bg-transparent text-masss-heading/50 hover:text-masss-heading',
  danger:    'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
  success:   'bg-masss-mint text-masss-heading hover:bg-masss-accent hover:text-white',
  white:     'bg-white text-masss-heading border border-masss-mint hover:bg-masss-bg',
}

export const FocusBtn = ({
  children,
  onClick,
  disabled,
  variant  = 'primary',
  size     = 'md',
  icon,
  fullWidth,
  className = '',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
      'transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
      SIZES[size],
      VARIANTS[variant],
      fullWidth && 'w-full',
      className,
    )}
  >
    {icon && icon}
    {children}
  </button>
)