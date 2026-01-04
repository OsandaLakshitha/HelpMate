export function computeContributionPercent(members) {
  const total = members.reduce((sum, m) => sum + (m.contributionTotal || 0), 0) || 0;
  return members.map(m => ({ ...m, percent: total ? (m.contributionTotal / total) * 100 : 0 }));
}

export function detectFreeRiders(members) {
  const avgActive = average(members.map(m => m.activeTimeMinutes || 0));
  const avgPercent = average(members.map(m => m.percent || 0));
  return members.map(m => ({
    ...m,
    freeRidingFlag: (m.activeTimeMinutes || 0) < (avgActive * 0.5) && (m.percent || 0) < (avgPercent * 0.5)
  }));
}

function average(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
