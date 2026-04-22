// frontend/src/features/masss/components/focus/FeedbackForm.jsx

import React, { useState } from 'react'
import { X, Coffee, CheckCircle, ChevronRight } from 'lucide-react'
import { StarRating } from './StarRating'
import { FocusBtn }   from './FocusBtn'

const RATING_LABEL = {
  5: 'Outstanding 🔥',
  4: 'Great session ✨',
  3: 'Decent work 👍',
  2: 'A bit rough 😓',
  1: 'Tough session 😕',
}

export const FeedbackForm = ({
  onContinue,
  onCompleteTask,
  onStopForNow,
  onDiscard,
  loading,
}) => {
  const [rating, setRating] = useState(0)

  return (
    <div className="bg-masss-white border border-masss-mint rounded-2xl p-7 w-full max-w-sm mx-auto shadow-sm space-y-6">

      {/* Header */}
      <div className="text-center">
        <h3 className="font-bold text-xl text-masss-heading">How was your focus?</h3>
        <p className="text-sm text-masss-heading/50 mt-1">
          Rate this session before continuing
        </p>
      </div>

      {/* Stars */}
      <div className="flex justify-center">
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Rating label */}
      {rating > 0 && (
        <p className="text-center text-sm text-masss-heading/60">
          {RATING_LABEL[rating]}
        </p>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <FocusBtn
          fullWidth
          variant="primary"
          size="md"
          icon={<ChevronRight size={15} />}
          disabled={rating === 0 || loading}
          onClick={() => onContinue(rating)}
        >
          {loading ? 'Saving...' : 'Continue to next session'}
        </FocusBtn>

        <FocusBtn
          fullWidth
          variant="secondary"
          size="md"
          icon={<Coffee size={15} />}
          disabled={rating === 0 || loading}
          onClick={() => onStopForNow(rating)}
        >
          Stop for now
        </FocusBtn>

        <FocusBtn
          fullWidth
          variant="success"
          size="md"
          icon={<CheckCircle size={15} />}
          disabled={rating === 0 || loading}
          onClick={() => onCompleteTask(rating)}
        >
          Task complete ✓
        </FocusBtn>

        <FocusBtn
          fullWidth
          variant="ghost"
          size="sm"
          icon={<X size={13} />}
          disabled={loading}
          onClick={onDiscard}
          className="text-masss-heading/40"
        >
          Discard session
        </FocusBtn>
      </div>
    </div>
  )
}