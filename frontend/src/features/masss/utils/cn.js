// frontend/src/features/masss/utils/cn.js

import { clsx }        from 'clsx'
import { twMerge }     from 'tailwind-merge'

/**
 * Utility for merging Tailwind classes safely.
 * Used by every MASSS component that has conditional styling.
 *
 * Example: cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export const cn = (...inputs) => twMerge(clsx(inputs))