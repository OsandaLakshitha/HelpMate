// frontend/src/features/masss/components/focus/StarRating.jsx

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

export const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-2">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={34}
            className={cn(
              'transition-colors',
              n <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-masss-mint',
            )}
          />
        </button>
      ))}
    </div>
  )
}