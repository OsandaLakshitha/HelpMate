// components/BProjectStats.jsx — Updated with RAP Engine formula data panel
// Props: projects (from dashboardData.projects), targetSummary (from dashboardData.targetSummary)
//
// RAP Engine field mapping (debug log → BPrediction field name):
//   'RCR [R1]'               → project.deadlinePressure
//   'complexityCapacity [R4]' → project.complexityCapacity
//   'loadFactor [R5]'         → project.loadFactor
//   'dailyTarget [R1+R5]'     → project.dailyTarget
//   'SPI(t) [R2+R3]'          → project.studentRatio
//   'TEAC_days [R2]'          → project.projectedDaysNeeded
//   'SV% [R1]'                → project.paceDelta
//   'resilienceScore [R7]'    → project.resilienceScore
//   'confidence [R6]'         → project.confidence
//   'rapStatus'               → project.rapStatus

export default function BProjectStats({ projects = [], targetSummary = {} }) {

  const total = projects.length;

  // ── RAP status counts ─────────────────────────────────────────────────────
  const rapCounts = projects.reduce((acc, p) => {
    const s = p.rapStatus || 'not-started';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const onTrackCount  = (rapCounts['on-track'] || 0) + (rapCounts['on-track-fragile'] || 0);
  const atRiskCount   = (rapCounts['at-risk']   || 0) + (rapCounts['at-risk-recoverable'] || 0);
  const dangerCount   = (rapCounts['in-danger'] || 0) + (rapCounts['danger-recoverable'] || 0);
  const completeCount =  rapCounts['complete']   || 0;
  const notStarted    =  rapCounts['not-started']|| 0;
  const overdueCount  = projects.filter(p => p.isOverdue).length;

  // ── Task totals ───────────────────────────────────────────────────────────
  const totalPending   = projects.reduce((s, p) => s + (p.pendingTaskCount || 0), 0);
  const totalCompleted = projects.reduce((s, p) => s + (p.completedToday   || 0), 0);
  const totalTarget    = projects.reduce((s, p) => s + (p.dailyTarget      || 0), 0);

  const overallProgress = totalTarget > 0
    ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;

  // ── Health score ──────────────────────────────────────────────────────────
  const healthWeights = {
    'on-track': 100, 'on-track-fragile': 75,
    'at-risk-recoverable': 55, 'at-risk': 40,
    'danger-recoverable': 20, 'in-danger': 10,
    'complete': 100, 'not-started': 50,
  };
  const healthScore = total > 0
    ? Math.round(projects.reduce((s, p) => s + (healthWeights[p.rapStatus] || 50), 0) / total)
    : 0;
  const healthColor = healthScore >= 75 ? '#059669' : healthScore >= 50 ? '#d97706' : '#dc2626';
  const healthLabel = healthScore >= 75 ? 'Healthy' : healthScore >= 50 ? 'At Risk' : 'Critical';

  // ── rapStatus config (identical to BDailyTargets.jsx) ────────────────────
  const rapCfgMap = {
    'on-track':            { color: '#059669', bg: '#ecfdf5', label: 'On Track',          icon: '✨' },
    'on-track-fragile':    { color: '#0891b2', bg: '#ecfeff', label: 'Fragile',           icon: '✨' },
    'at-risk-recoverable': { color: '#d97706', bg: '#fffbeb', label: 'Can Catch Up',      icon: '🔄' },
    'at-risk':             { color: '#d97706', bg: '#fffbeb', label: 'Behind',            icon: '⚠️' },
    'danger-recoverable':  { color: '#ea580c', bg: '#fff7ed', label: 'Urgent · Recover',  icon: '⚡' },
    'in-danger':           { color: '#dc2626', bg: '#fef2f2', label: 'Urgent',            icon: '🚨' },
    'complete':            { color: '#7c3aed', bg: '#f5f3ff', label: 'Done 🎉',           icon: '✅' },
    'not-started':         { color: '#94a3b8', bg: '#f8fafc', label: 'Not Started',       icon: '👋' },
  };

  // ── Sort by urgency ───────────────────────────────────────────────────────
  const severity = {
    'in-danger': 0, 'danger-recoverable': 1, 'at-risk': 2,
    'at-risk-recoverable': 3, 'on-track-fragile': 4,
    'on-track': 5, 'not-started': 6, 'complete': 7,
  };
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return (severity[a.rapStatus] ?? 6) - (severity[b.rapStatus] ?? 6);
  });

  const fmt = (v, dp = 2) =>
    v === null || v === undefined ? '—' : Number(v).toFixed(dp);

  if (!total) {
    return (
      <div style={s.emptyWrap}>
        <p style={{ fontSize: 28, margin: 0 }}>📊</p>
        <p style={s.emptyTitle}>No project stats yet</p>
        <p style={s.emptySub}>Create a project to see your statistics.</p>
      </div>
    );
  }

  return (
    <div style={s.wrap}>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Summary cards                                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <h2 style={s.sectionTitle}>📊 Project Statistics</h2>

      <div style={s.cardRow}>

        {/* Health score */}
        <div style={{ ...s.card, ...s.healthCard }}>
          <div style={{ ...s.healthRing, borderColor: healthColor }}>
            <span style={{ ...s.healthNum, color: healthColor }}>{healthScore}</span>
            <span style={s.healthPct}>/ 100</span>
          </div>
          <div>
            <p style={s.cardLabel}>Overall Health</p>
            <p style={{ ...s.cardBadge, color: healthColor, background: healthColor + '18' }}>
              {healthLabel}
            </p>
          </div>
        </div>

        {/* Daily progress */}
        <div style={s.card}>
          <p style={s.cardLabel}>Today's Progress</p>
          <p style={{ ...s.cardBig, color: overallProgress >= 100 ? '#059669' : overallProgress >= 50 ? '#d97706' : '#dc2626' }}>
            {overallProgress}%
          </p>
          <div style={s.miniBar}>
            <div style={{
              ...s.miniBarFill,
              width: `${overallProgress}%`,
              background: overallProgress >= 100 ? '#059669' : overallProgress >= 50 ? '#d97706' : '#dc2626',
            }} />
          </div>
          <p style={s.cardSub}>{totalCompleted} / {totalTarget} tasks done today</p>
        </div>

        {/* Targets met / missed */}
        <div style={s.card}>
          <p style={s.cardLabel}>Daily Targets</p>
          <div style={s.targetRow}>
            <div style={s.targetItem}>
              <span style={{ ...s.targetNum, color: '#059669' }}>{targetSummary?.met ?? 0}</span>
              <span style={s.targetLbl}>Met ✅</span>
            </div>
            <div style={s.divider} />
            <div style={s.targetItem}>
              <span style={{ ...s.targetNum, color: '#dc2626' }}>{targetSummary?.missed ?? 0}</span>
              <span style={s.targetLbl}>Missed ❌</span>
            </div>
          </div>
          <p style={s.cardSub}>{total} active project{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Task overview */}
        <div style={s.card}>
          <p style={s.cardLabel}>Task Overview</p>
          <p style={{ ...s.cardBig, color: '#3b82f6' }}>{totalPending}</p>
          <p style={s.cardSub}>tasks remaining</p>
          {overdueCount > 0 && (
            <p style={s.overdueChip}>⏰ {overdueCount} overdue project{overdueCount !== 1 ? 's' : ''}</p>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — RAP Status Breakdown                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div style={s.card}>
        <p style={{ ...s.cardLabel, marginBottom: 12 }}>RAP Status Breakdown</p>
        <div style={s.stackedBar}>
          {[
            { count: onTrackCount,  color: '#059669', label: 'On Track'    },
            { count: atRiskCount,   color: '#d97706', label: 'At Risk'     },
            { count: dangerCount,   color: '#dc2626', label: 'In Danger'   },
            { count: completeCount, color: '#7c3aed', label: 'Complete'    },
            { count: notStarted,    color: '#cbd5e1', label: 'Not Started' },
          ].filter(seg => seg.count > 0).map((seg, i) => (
            <div key={i} title={`${seg.label}: ${seg.count}`} style={{
              height: '100%',
              width: `${(seg.count / total) * 100}%`,
              background: seg.color,
              borderRadius: i === 0 ? '99px 0 0 99px' : '',
            }} />
          ))}
        </div>
        <div style={s.legend}>
          {[
            { count: onTrackCount,  color: '#059669', label: 'On Track'    },
            { count: atRiskCount,   color: '#d97706', label: 'At Risk'     },
            { count: dangerCount,   color: '#dc2626', label: 'In Danger'   },
            { count: completeCount, color: '#7c3aed', label: 'Complete'    },
            { count: notStarted,    color: '#cbd5e1', label: 'Not Started' },
            { count: overdueCount,  color: '#f97316', label: 'Overdue'     },
          ].map((item, i) => (
            <div key={i} style={s.legendItem}>
              <div style={{ ...s.dot, background: item.color }} />
              <span style={s.legendLabel}>{item.label}</span>
              <span style={s.legendCount}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Per-project summary table                             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div style={s.card}>
        <p style={{ ...s.cardLabel, marginBottom: 0 }}>Per-Project Breakdown</p>
        <p style={s.cardSub}>Sorted by urgency</p>
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span style={{ ...s.th, flex: 2 }}>Project</span>
            <span style={{ ...s.th, flex: 1 }}>RAP Status</span>
            <span style={{ ...s.th, flex: 1 }}>Today</span>
            <span style={{ ...s.th, flex: 1 }}>Pending</span>
            <span style={{ ...s.th, flex: 1 }}>Due</span>
          </div>
          {sortedProjects.map((project, i) => {
            const rapCfg = rapCfgMap[project.rapStatus] || { color: '#94a3b8', bg: '#f8fafc', label: '—', icon: '❓' };
            const progPct = project.dailyTarget > 0
              ? Math.min(100, Math.round((project.completedToday / project.dailyTarget) * 100)) : 0;
            const isLast = i === sortedProjects.length - 1;
            return (
              <div key={project.projectId} style={{
                ...s.tableRow,
                borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                borderLeft: `3px solid ${project.isOverdue ? '#f97316' : rapCfg.color}`,
                background: project.isOverdue ? '#fff7ed' : '#fff',
              }}>
                <div style={{ flex: 2, minWidth: 0 }}>
                  <p style={s.projName}>
                    {project.isOverdue && <span style={s.overdueTag}>OVERDUE</span>}
                    {project.title}
                  </p>
                  {project.coldStart && (
                    <p style={s.projSub}>🔐 {project.completionsNeeded ?? 4} tasks to unlock</p>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 99, background: rapCfg.bg, color: rapCfg.color, whiteSpace: 'nowrap' }}>
                    {rapCfg.icon} {rapCfg.label}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  {project.dailyTarget > 0 && !project.coldStart ? (
                    <>
                      <p style={s.progText}>{project.completedToday ?? 0}/{project.dailyTarget}</p>
                      <div style={s.miniBar}>
                        <div style={{ ...s.miniBarFill, width: `${progPct}%`, background: progPct >= 100 ? '#059669' : progPct >= 50 ? '#d97706' : '#dc2626' }} />
                      </div>
                    </>
                  ) : <span style={s.dimText}>—</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: (project.pendingTaskCount ?? 0) > 5 ? '#dc2626' : '#0f172a' }}>
                    {project.pendingTaskCount ?? 0}
                  </span>
                  <span style={s.dimText}> tasks</span>
                </div>
                <div style={{ flex: 1 }}>
                  {project.isOverdue
                    ? <span style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>⏰ +{project.daysOverdue ?? '?'}d</span>
                    : project.dueDate
                      ? <span style={s.dueText}>{new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      : <span style={s.dimText}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — RAP Engine formula outputs per project  ← NEW         */}
      {/* Displays every value from the predictionEngine.js debug log       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <h2 style={{ ...s.sectionTitle, marginTop: 4 }}>🔬 RAP Prediction Output</h2>
      <p style={{ margin: '-8px 0 4px', fontSize: 12, color: '#94a3b8' }}>
        All values calculated by your performance per project
      </p>

      {sortedProjects.map(project => {
        const rapCfg = rapCfgMap[project.rapStatus] || { color: '#94a3b8', bg: '#f8fafc', label: '—', icon: '❓' };

        // ── Map debug log keys → BPrediction field names ──────────────────
        const rcr        = project.deadlinePressure    ?? null;  // RCR [R1]
        const clCap      = project.complexityCapacity  ?? null;  // complexityCapacity [R4]
        const loadFac    = project.loadFactor          ?? null;  // loadFactor [R5]
        const dailyTgt   = project.dailyTarget         ?? null;  // dailyTarget [R1+R5]
        const spiT       = project.studentRatio        ?? null;  // SPI(t) [R2+R3]
        const teac       = project.projectedDaysNeeded ?? null;  // TEAC_days [R2]
        const svPct      = project.paceDelta           ?? null;  // SV% [R1]
        const resilience = project.resilienceScore     ?? null;  // resilienceScore [R7]
        const conf       = project.confidence          ?? null;  // confidence [R6]
        const daysLeft   = project.daysLeft            ?? null;

        // ── Per-metric colour logic ───────────────────────────────────────
        const rcrColor  = rcr === null || clCap === null ? '#94a3b8'
          : rcr <= clCap * 0.75 ? '#059669' : rcr <= clCap ? '#d97706' : '#dc2626';

        const spiColor  = spiT === null ? '#94a3b8'
          : spiT >= 1 ? '#059669' : spiT >= 0.7 ? '#d97706' : '#dc2626';

        const svColor   = svPct === null ? '#94a3b8'
          : svPct >= 0 ? '#059669' : svPct >= -10 ? '#d97706' : '#dc2626';

        const resColor  = resilience === null ? '#94a3b8'
          : resilience >= 60 ? '#059669' : resilience >= 40 ? '#d97706' : '#dc2626';

        const confColor = conf === null ? '#94a3b8'
          : conf >= 0.7 ? '#059669' : conf >= 0.5 ? '#d97706' : '#94a3b8';

        const teacColor = teac === null || daysLeft === null ? '#94a3b8'
          : teac <= daysLeft ? '#059669' : teac <= daysLeft * 1.2 ? '#d97706' : '#dc2626';

        const lfColor   = loadFac === null ? '#94a3b8'
          : loadFac >= 0.9 ? '#059669' : loadFac >= 0.7 ? '#d97706' : '#dc2626';

        return (
          <div key={`rap-${project.projectId}`} style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
            borderLeft: `4px solid ${rapCfg.color}`,
            overflow: 'hidden',
          }}>

            {/* ── Card header ── */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid #f1f5f9',
              background: rapCfg.bg,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {project.isOverdue && <span style={{ ...s.overdueTag, marginRight: 6 }}>OVERDUE</span>}
                  {project.title}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>
                  Your Performance · studentId: {project.studentId ?? '—'}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 12px',
                borderRadius: 99, background: '#fff',
                color: rapCfg.color, border: `1px solid ${rapCfg.color}44`,
                whiteSpace: 'nowrap',
              }}>
                {rapCfg.icon} {rapCfg.label}
              </span>
            </div>

            {/* ── 3-column formula grid ── */}
            <div style={s.rapGrid}>

              {/* 1. RCR [R1] */}
              <RAPCell
                tag="Required Pace" 
                label="Tasks needed per day to finish on time"
                formula="pending ÷ daysLeft"
                value={fmt(rcr)} unit="tasks/day"
                color={rcrColor}
                bar={clCap > 0 ? Math.min(100, (rcr / clCap) * 100) : 0}
                hint={rcr === null ? null
                  : rcr <= 0.5     ? 'Well ahead of schedule'
                  : rcr <= clCap   ? 'Achievable pace'
                  : 'Exceeds capacity — risk'}
              />

              {/* 2. SPI(t) [R2+R3] */}
              <RAPCell
                tag="Progress Trend" 
                label="Your recent performance vs. target"
                formula="EWMA of daily ratio SPI(t)"
                value={fmt(spiT)} unit=""
                color={spiColor}
                bar={spiT !== null ? Math.min(100, spiT * 100) : 0}
                hint={spiT === null ? null
                  : spiT >= 1   ? 'On or ahead of schedule'
                  : spiT >= 0.7 ? 'Slightly behind — recoverable'
                  : 'Significantly behind'}
              />

              {/* 3. TEAC_days [R2] */}
              <RAPCell
                tag="Estimated Finish" 
                label="Projected days to complete at current pace"
                formula="daysLeft ÷ SPI(t)=TEAC"
                value={teac !== null ? `${Math.round(teac)}d` : '—'}
                unit={daysLeft !== null ? `/ ${daysLeft}d left` : ''}
                color={teacColor}
                bar={teac && daysLeft && teac > 0 ? Math.min(100, (daysLeft / teac) * 100) : 0}
                hint={teac === null || daysLeft === null ? null
                  : teac <= daysLeft       ? 'Will finish on time ✓'
                  : `~${Math.round(teac - daysLeft)}d overrun projected`}
              />

              {/* 4. SV% [R1] */}
              <RAPCell
                tag="Schedule Position" 
                label="Ahead (+) or behind (−) ideal progress"
                formula="work% − time% = SV"
                value={svPct !== null ? (svPct >= 0 ? `+${fmt(svPct,1)}` : fmt(svPct,1)) : '—'}
                unit="%"
                color={svColor}
                bar={project.workCompletionPct ?? 0}
                sub={project.workCompletionPct !== null && project.timeElapsedPct !== null
                  ? `Work ${project.workCompletionPct?.toFixed(1)}%  ·  Time ${project.timeElapsedPct?.toFixed(1)}%`
                  : null}
                hint={svPct === null ? null
                  : svPct >= 0    ? 'Ahead of schedule'
                  : svPct >= -10  ? 'Slightly behind'
                  : 'Significantly behind'}
              />

              {/* 5. resilienceScore [R7] */}
              <RAPCell
                tag="Resilience - Recovery Potential" 
                label="Your buffer to catch up if behind"
                formula="(cap ÷ RCR) × 100"
                value={fmt(resilience, 0)} unit="/ 100"
                color={resColor}
                bar={resilience !== null ? Math.min(100, resilience) : 0}
                hint={resilience === null ? null
                  : resilience >= 60 ? 'Resilient — can recover ✓'
                  : resilience >= 40 ? 'Low resilience'
                  : 'High deadline risk'}
              />

              {/* 6. confidence [R6] */}
              <RAPCell
                tag="Confidence" 
                label="How reliable this prediction is"
                formula="0.30 + n × 0.05"
                value={conf !== null ? `${Math.round(conf * 100)}%` : '—'} unit=""
                color={confColor}
                bar={conf !== null ? conf * 100 : 0}
                hint={conf === null ? null
                  : conf < 0.5  ? 'Low — need more data'
                  : conf < 0.7  ? 'Moderate — building'
                  : 'Reliable prediction ✓'}
              />

              {/* 7. complexityCapacity [R4] */}
              <RAPCell
                tag="Daily Capacity" 
                label="Max realistic tasks/day based on difficulty (CLT)"
                
                value={fmt(clCap, 1)} unit="tasks/day max"
                color="#3b82f6"
                bar={clCap !== null ? (clCap / 2) * 100 : 0}
                hint={clCap === null ? null
                  : clCap >= 2   ? 'Low complexity ceiling'
                  : clCap >= 1.5 ? 'Medium complexity ceiling'
                  : 'High complexity ceiling'}
              />

              {/* 8. loadFactor [R5] */}
              <RAPCell
                tag="Focus Adjustment" 
                label="Focus % after accounting for other projects"
                
                value={fmt(loadFac, 2)}
                unit={project.activeProjects ? `(${project.activeProjects} proj)` : ''}
                color={lfColor}
                bar={loadFac !== null ? loadFac * 100 : 0}
                hint={loadFac === null ? null
                  : loadFac >= 1.0  ? 'No switching cost'
                  : loadFac >= 0.82 ? '~15% switching cost'
                  : loadFac >= 0.67 ? '~30% switching cost'
                  : '~40% switching cost'}
              />

              {/* 9. dailyTarget [R1+R5] — highlighted */}
              <RAPCell
                tag="Daily Target" 
                label="Tasks to complete today to stay on track"
                
                value={dailyTgt !== null ? String(dailyTgt) : '—'} unit="tasks"
                color="#6366f1"
                bar={dailyTgt !== null && clCap ? Math.min(100, (dailyTgt / clCap) * 100) : 0}
                hint={dailyTgt === null ? null
                  : dailyTgt === 0 ? 'All done! 🎉'
                  : `Complete ${dailyTgt} task${dailyTgt !== 1 ? 's' : ''} today`}
                highlight
              />

            </div>

            {/* ── Confidence footer ── */}
            <div style={{ padding: '10px 18px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                {project.isEstimated
                  ? '⚠️ Estimated only — complete more tasks to improve accuracy'
                  : `✅ ${project.dataPointsUsed ?? '?'} data points · Confidence: ${conf !== null ? Math.round(conf * 100) : '?'}%`}
                {project.capacityWarning && (
                  <span style={{ marginLeft: 8, color: '#d97706', fontWeight: 600 }}>
                    · ⚠️ {project.capacityWarning}
                  </span>
                )}
              </p>
            </div>

          </div>
        );
      })}

    </div>
  );
}

// ── RAPCell — single formula metric card ──────────────────────────────────────
function RAPCell({ tag, ref_, label, formula, value, unit, color, bar, hint, sub, highlight }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRight: '1px solid #f1f5f9',
      borderBottom: '1px solid #f1f5f9',
      background: highlight ? color + '06' : '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      {/* Tag row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '2px 6px',
          borderRadius: 99, background: color + '18', color,
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {tag}
        </span>
        <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 600 }}>{ref_}</span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 10, color: '#94a3b8' }}>{unit}</span>}
      </div>

      {/* Bar */}
      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', margin: '4px 0' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${Math.min(100, Math.max(0, bar ?? 0))}%`,
          background: color, transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Label */}
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>{label}</p>

      {/* Formula monospace */}
      <p style={{ margin: 0, fontSize: 9, color: '#94a3b8', fontFamily: 'monospace' }}>{formula}</p>

      {/* Sub text */}
      {sub && <p style={{ margin: '2px 0 0', fontSize: 9, color: '#64748b' }}>{sub}</p>}

      {/* Hint */}
      {hint && (
        <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 500, color, lineHeight: 1.3 }}>{hint}</p>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  wrap:        { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle:{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 },
  cardRow:     { display: 'flex', gap: 12, flexWrap: 'wrap' },
  card: {
    flex: '1 1 180px', background: '#fff', borderRadius: 16,
    padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9', minWidth: 160,
  },
  healthCard:  { display: 'flex', alignItems: 'center', gap: 16 },
  healthRing: {
    width: 64, height: 64, borderRadius: '50%', border: '4px solid',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  healthNum:   { fontSize: 20, fontWeight: 800, lineHeight: 1 },
  healthPct:   { fontSize: 9, color: '#94a3b8' },
  cardLabel:   { fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  cardBig:     { fontSize: 32, fontWeight: 800, margin: '0 0 4px', lineHeight: 1 },
  cardSub:     { fontSize: 11, color: '#94a3b8', margin: '4px 0 0' },
  cardBadge:   { display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, margin: '4px 0 0' },
  targetRow:   { display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' },
  targetItem:  { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  targetNum:   { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  targetLbl:   { fontSize: 11, color: '#64748b', marginTop: 2 },
  divider:     { width: 1, height: 40, background: '#e2e8f0' },
  overdueChip: { margin: '8px 0 0', fontSize: 11, fontWeight: 700, color: '#f97316', background: '#fff7ed', padding: '3px 8px', borderRadius: 99, display: 'inline-block' },
  miniBar:     { height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', margin: '4px 0' },
  miniBarFill: { height: '100%', borderRadius: 99, transition: 'width 0.5s ease' },
  stackedBar:  { height: 12, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', display: 'flex', marginBottom: 12 },
  legend:      { display: 'flex', flexWrap: 'wrap', gap: 12 },
  legendItem:  { display: 'flex', alignItems: 'center', gap: 5 },
  dot:         { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 11, color: '#64748b' },
  legendCount: { fontSize: 11, fontWeight: 700, color: '#0f172a' },
  tableWrap:   { marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid #f1f5f9' },
  tableHead:   { display: 'flex', padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th:          { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' },
  tableRow:    { display: 'flex', alignItems: 'center', padding: '12px', gap: 8, transition: 'background 0.15s ease' },
  projName:    { margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 },
  projSub:     { margin: '2px 0 0', fontSize: 11, color: '#94a3b8' },
  overdueTag:  { fontSize: 9, fontWeight: 800, color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa', padding: '1px 5px', borderRadius: 4, flexShrink: 0 },
  progText:    { fontSize: 12, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' },
  dimText:     { fontSize: 12, color: '#cbd5e1' },
  dueText:     { fontSize: 12, fontWeight: 500, color: '#64748b' },
  rapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    borderTop: '1px solid #f1f5f9',
  },
  emptyWrap:   { textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  emptyTitle:  { margin: '8px 0 4px', fontSize: 15, fontWeight: 600, color: '#0f172a' },
  emptySub:    { margin: 0, fontSize: 13, color: '#64748b' },
};