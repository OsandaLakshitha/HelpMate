import BCompletion from '../../models/Bmodels/Bcompletion.js';

// Behavioral Completion Profile
// Groups student's completion history by complexity level.
// Returns per-group speed ratios used by claudeService and predictionEngine.
export const calcBCP = async (studentId) => {
  try {
    const completions = await BCompletion.find({ studentId });
    if (!completions?.length) return null;

    return {
      easy:   groupStats(completions.filter(c => c.complexity <= 2)),
      medium: groupStats(completions.filter(c => c.complexity === 3)),
      hard:   groupStats(completions.filter(c => c.complexity >= 4)),
    };
  } catch (err) {
    console.error('BCP error:', err.message);
    return null;
  }
};

const groupStats = (items) => {
  if (!items.length) return { speedRatio: null, onTimeRate: null, avgDaysEarlyLate: null, taskCount: 0 };
  const n = items.length;
  return {
    speedRatio:       r(items.reduce((s, c) => s + c.speedRatio,       0) / n),
    onTimeRate:       r(items.filter(c => c.completedOnTime).length / n),
    avgDaysEarlyLate: r(items.reduce((s, c) => s + c.daysEarlyOrLate, 0) / n),
    taskCount:        n,
  };
};

const r = (v) => Math.round(v * 100) / 100;