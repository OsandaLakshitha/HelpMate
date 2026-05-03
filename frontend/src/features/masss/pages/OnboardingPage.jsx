// frontend/src/features/masss/pages/OnboardingPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Sunset, ChevronRight, ChevronLeft, Check, Plus, Trash2 } from 'lucide-react'
import { useOnboarding } from '../hooks/useOnboarding'
import { useMasss } from '../context/MasssContext'

const CHRONOTYPES = [
  {
    id:    'morning_bird',
    label: 'Morning Bird',
    icon:  Sun,
    desc:  'Most productive in the early hours. Best focus before noon.',
  },
  {
    id:    'balanced',
    label: 'Balanced',
    icon:  Sunset,
    desc:  'Steady energy throughout the day with a slight afternoon peak.',
  },
  {
    id:    'night_owl',
    label: 'Night Owl',
    icon:  Moon,
    desc:  'Peak performance in the evening. Deep focus late at night.',
  },
]

const DAYS    = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const ACTIVITIES = ['class','work','habit','sleep']

const STEP_LABELS = ['Chronotype', 'Routine', 'Slots']

export default function OnboardingPage() {
  const navigate                        = useNavigate()
  const { completeOnboarding, skipOnboarding, getSlotDefaults, loading } = useOnboarding()
  const { setOnboardingCompleted }      = useMasss()

  const [step,        setStep]        = useState(0)
  const [chronotype,  setChronotype]  = useState('')
  const [slots,       setSlots]       = useState([])
  const [routine,     setRoutine]     = useState([])
  const [error,       setError]       = useState(null)

  // ── Step 1: pick chronotype + fetch slot defaults ────────────────────────
  const handleChronotypeSelect = async (id) => {
    setChronotype(id)
    try {
      const defaults = await getSlotDefaults(id)
      setSlots(defaults.map(s => ({
        slot_name:     s.slot_name,
        slot_label:    s.slot_label,
        start_time:    s.start_time,
        end_time:      s.end_time,
        max_pomodoros: calcMaxPomos(slot.start_time, slot.end_time) ?? slot.max_pomodoros,

      })))
    } catch {
      setError('Failed to load slot defaults.')
    }
  }

  // ── Routine helpers ───────────────────────────────────────────────────────
  const addRoutineEvent = () => {
    setRoutine(prev => [...prev, {
      name:          '',
      activity_type: 'class',
      days:          [],
      start_time:    '09:00',
      end_time:      '11:00',
    }])
  }

  const updateRoutine = (idx, field, value) => {
    setRoutine(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  const toggleDay = (idx, day) => {
    setRoutine(prev => prev.map((e, i) => {
      if (i !== idx) return e
      const days = e.days.includes(day)
        ? e.days.filter(d => d !== day)
        : [...e.days, day]
      return { ...e, days }
    }))
  }

  const removeRoutine = (idx) => {
    setRoutine(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Slot helpers ──────────────────────────────────────────────────────────
  const updateSlot = (idx, field, value) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    setError(null)
    try {
      await completeOnboarding({ chronotype, slots, routine_events: routine })
      setOnboardingCompleted(true)
      navigate('/masss/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    }
  }

  const handleSkip = async () => {
    try {
      await skipOnboarding()
      setOnboardingCompleted(true)
      navigate('/masss/dashboard', { replace: true })
    } catch {}
  }

  const canNext = () => {
    if (step === 0) return !!chronotype
    if (step === 1) return true
    if (step === 2) return slots.length === 3 && slots.every(s => s.slot_label && s.start_time && s.end_time)
    return false
  }

 const calcMaxPomos = (start, end) => {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  return mins > 0 ? Math.floor(mins / 25) : null
}

  return (
    <div className="min-h-screen bg-masss-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-masss-accent rounded-xl mb-4">
            <span className="text-white font-extrabold text-lg">M</span>
          </div>
          <h1 className="text-2xl font-bold text-masss-heading">Set up your Study Scheduler</h1>
          <p className="text-sm text-masss-accent mt-1">Takes about 2 minutes</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  i < step  ? 'bg-masss-accent text-white' : '',
                  i === step ? 'bg-masss-accent text-white' : '',
                  i > step  ? 'bg-masss-mint text-masss-heading/50' : '',
                ].join(' ')}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  i === step ? 'text-masss-heading' : 'text-masss-heading/40'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-px w-8 transition-colors ${i < step ? 'bg-masss-accent' : 'bg-masss-mint'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-masss-white border border-masss-mint rounded-2xl p-6 shadow-sm">
          <AnimatePresence mode="wait">

            {/* ── Step 0: Chronotype ─────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-bold text-masss-heading mb-1">What is your study chronotype?</h2>
                <p className="text-[10px] text-masss-heading/40 mt-1">
  Max study sessions in this slot only
</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {CHRONOTYPES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleChronotypeSelect(c.id)}
                      className={[
                        'flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer text-center',
                        chronotype === c.id
                          ? 'border-masss-accent bg-masss-bg'
                          : 'border-masss-mint bg-masss-bg/50 hover:border-masss-accent/50',
                      ].join(' ')}
                    >
                      <div className={[
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        chronotype === c.id ? 'bg-masss-accent' : 'bg-masss-mint',
                      ].join(' ')}>
                        <c.icon size={22} className={chronotype === c.id ? 'text-white' : 'text-masss-accent'} />
                      </div>
                      <div>
                        <p className="font-semibold text-masss-heading text-sm">{c.label}</p>
                        <p className="text-xs text-masss-heading/50 mt-1 leading-relaxed">{c.desc}</p>
                      </div>
                      {chronotype === c.id && (
                        <div className="w-5 h-5 rounded-full bg-masss-accent flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Routine ────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-bold text-masss-heading mb-1">Weekly routine</h2>
                <p className="text-sm text-masss-heading/50 mb-5">
                  Add recurring events so the scheduler avoids them. Optional — skip if not needed.
                </p>

                <div className="space-y-4 max-h-80 overflow-y-auto masss-scroll pr-1">
                  {routine.map((event, idx) => (
                    <div key={idx} className="p-4 bg-masss-bg rounded-xl border border-masss-mint space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Event name (e.g. Physics Lecture)"
                          value={event.name}
                          onChange={e => updateRoutine(idx, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-masss-mint bg-masss-white text-masss-heading placeholder:text-masss-heading/30 focus:outline-none focus:border-masss-accent"
                        />
                        <button
                          onClick={() => removeRoutine(idx)}
                          className="p-2 text-masss-heading/30 hover:text-masss-danger transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {ACTIVITIES.map(a => (
                          <button
                            key={a}
                            onClick={() => updateRoutine(idx, 'activity_type', a)}
                            className={[
                              'px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize',
                              event.activity_type === a
                                ? 'bg-masss-accent text-white border-masss-accent'
                                : 'bg-masss-white text-masss-heading/60 border-masss-mint hover:border-masss-accent',
                            ].join(' ')}
                          >
                            {a}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS.map(d => (
                          <button
                            key={d}
                            onClick={() => toggleDay(idx, d)}
                            className={[
                              'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors capitalize',
                              event.days.includes(d)
                                ? 'bg-masss-accent text-white border-masss-accent'
                                : 'bg-masss-white text-masss-heading/60 border-masss-mint hover:border-masss-accent',
                            ].join(' ')}
                          >
                            {d.slice(0, 3)}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-masss-heading/50 mb-1 block">Start</label>
                          <input
                            type="time"
                            value={event.start_time}
                            onChange={e => updateRoutine(idx, 'start_time', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-masss-mint bg-masss-white text-masss-heading focus:outline-none focus:border-masss-accent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-masss-heading/50 mb-1 block">End</label>
                          <input
                            type="time"
                            value={event.end_time}
                            onChange={e => updateRoutine(idx, 'end_time', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-masss-mint bg-masss-white text-masss-heading focus:outline-none focus:border-masss-accent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addRoutineEvent}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-masss-mint text-masss-accent text-sm font-medium hover:bg-masss-bg transition-colors"
                >
                  <Plus size={15} />
                  Add event
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Slots ──────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-bold text-masss-heading mb-1">Configure your study slots</h2>
                <p className="text-sm text-masss-heading/50 mb-5">
                  Pre-filled from your chronotype. Adjust to match your actual schedule.
                </p>

                <div className="space-y-4">
                  {slots.map((slot, idx) => (
                    <div key={slot.slot_name} className="p-4 bg-masss-bg rounded-xl border border-masss-mint space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-masss-mint text-masss-heading text-xs font-semibold capitalize">
                          {slot.slot_name}
                        </span>
                      </div>

                      <div>
                        <label className="text-xs text-masss-heading/50 mb-1 block">Display label</label>
                        <input
                          type="text"
                          value={slot.slot_label}
                          onChange={e => updateSlot(idx, 'slot_label', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-masss-mint bg-masss-white text-masss-heading focus:outline-none focus:border-masss-accent"
                          placeholder="e.g. Deep Work, Night Grind"
                        />
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-masss-heading/50 mb-1 block">Start time</label>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={e => updateSlot(idx, 'start_time', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-masss-mint bg-masss-white text-masss-heading focus:outline-none focus:border-masss-accent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-masss-heading/50 mb-1 block">End time</label>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={e => updateSlot(idx, 'end_time', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-masss-mint bg-masss-white text-masss-heading focus:outline-none focus:border-masss-accent"
                          />
                        </div>
           <div className="w-24 flex flex-col justify-end">
  <label className="text-xs text-masss-heading/50 mb-1 block">Max pomos</label>
  <div className="px-3 py-2 text-sm rounded-lg border border-masss-mint bg-masss-bg text-masss-accent font-semibold text-center">
    {calcMaxPomos(slot.start_time, slot.end_time) ?? '—'} 🍅
  </div>
</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-masss-danger text-center">{error}</p>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-masss-mint text-masss-heading/60 text-sm hover:bg-masss-bg transition-colors"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              )}
              <button
                onClick={handleSkip}
                className="px-4 py-2 rounded-lg text-masss-heading/40 text-sm hover:text-masss-heading/60 transition-colors"
              >
                Skip setup
              </button>
            </div>

            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Next
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading || !canNext()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-masss-accent text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {loading ? 'Saving...' : 'Get started'}
                {!loading && <Check size={15} />}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}