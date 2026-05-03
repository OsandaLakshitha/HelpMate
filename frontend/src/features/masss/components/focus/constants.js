// frontend/src/features/masss/components/focus/constants.js

// export const WORK_DURATION        = 25 * 60
// export const SHORT_BREAK          = 5  * 60
// export const LONG_BREAK           = 15 * 60
export const WORK_DURATION        = 10
export const SHORT_BREAK          = 4
export const LONG_BREAK           = 3
export const SESSIONS_BEFORE_LONG = 4

export const MODE = {
  LOBBY:        'LOBBY',
  RUNNING:      'RUNNING',
  PAUSED:       'PAUSED',
  FEEDBACK:     'FEEDBACK',
  BREAK:        'BREAK',
  BREAK_PROMPT: 'BREAK_PROMPT',
}

export const fmt = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}