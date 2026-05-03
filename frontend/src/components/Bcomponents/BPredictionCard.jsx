// components/Bcomponents/RAPPredictionCard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

// ── RAP Status Config (Simple labels + friendly colors) ─────────────────────
const RAP = {
  'on-track':            { label: 'On Track',              color: '#059669', bg: '#ecfdf5', icon: '✨' },
  'on-track-fragile':    { label: 'On Track',              color: '#0891b2', bg: '#ecfeff', icon: '✨' },
  'at-risk-recoverable': { label: 'A Bit Behind',          color: '#d97706', bg: '#fffbeb', icon: '🔄' },
  'at-risk':             { label: 'Behind Schedule',       color: '#d97706', bg: '#fffbeb', icon: '⚠️' },
  'danger-recoverable':  { label: 'Urgent · Can Catch Up', color: '#ea580c', bg: '#fff7ed', icon: '⚡' },
  'in-danger':           { label: 'Urgent',                color: '#dc2626', bg: '#fef2f2', icon: '🚨' },
  'complete':            { label: 'Done! 🎉',              color: '#7c3aed', bg: '#f5f3ff', icon: '✅' },
  'not-started':         { label: 'Not Started',           color: '#94a3b8', bg: '#f8fafc', icon: '👋' },
};

// ── Simple Progress Bar ─────────────────────────────────────────────────────
function ProgressBar({ pct, color }) {
  const percentage = Math.min(100, Math.max(0, pct || 0));
  return (
    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ 
        height: '100%', 
        width: `${percentage}%`, 
        background: color, 
        borderRadius: 99, 
        transition: 'width 0.6s ease' 
      }} />
    </div>
  );
}

// ── Info Icon with Tooltip ──────────────────────────────────────────────────
function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ 
          cursor: 'help', 
          color: '#94a3b8', 
          fontSize: 14,
          marginLeft: 4
        }}
      >
        ℹ️
      </span>
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 11,
          maxWidth: 220,
          textAlign: 'center',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          whiteSpace: 'normal',
          lineHeight: 1.4
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '6px solid transparent',
            borderTopColor: '#1e293b'
          }} />
        </div>
      )}
    </span>
  );
}

// ── Cold Start Placeholder ──────────────────────────────────────────────────
function ColdStart({ needed = 4, done = 0 }) {
  const remaining = Math.max(0, needed - done);
  return (
    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
        Predictions unlock soon!
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
        Complete {remaining} more task{remaining !== 1 ? 's' : ''} to see your personalized plan.
      </p>
      <div style={{ marginTop: 14, display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: i < done ? '#059669' : '#e2e8f0',
            transition: 'background 0.3s ease'
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Prediction Factors (Simple explanations with ALL factors) ───────────────
function PredictionFactors({ data }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!data || data.coldStart || data.newProjectPending) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          padding: '8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          width: '100%',
          textAlign: 'left'
        }}
      >
        {showDetails ? '🔼 Hide details' : '🔽 How is this calculated?'}
      </button>

      {showDetails && (
        <div style={{
          marginTop: 12,
          padding: 16,
          background: '#f8fafc',
          borderRadius: 12,
          fontSize: 13,
        }}>
          <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            📊 How your prediction works
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* 🎯 Daily Target */}
            <div>
              <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                🎯 Today's Target <InfoTip text="Based on your deadline and how many projects you're working on." />
              </p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a', fontSize: 18 }}>
                {data.dailyTarget != null ? `${data.dailyTarget} tasks` : '—'}
              </p>
              {data.deadlinePressure != null && (
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  Required: {data.deadlinePressure.toFixed(2)} tasks/day
                </p>
              )}
            </div>

            {/* 🧠 Recovery Power */}
            <div>
              <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                🧠 Recovery Power <InfoTip text="How well you can catch up if you fall behind. 60+ = you have buffer to recover." />
              </p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: data.resilienceScore != null ? (data.resilienceScore >= 60 ? '#059669' : '#d97706') : '#94a3b8', fontSize: 18 }}>
                {data.resilienceScore != null ? `${data.resilienceScore}/100` : '—'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: data.resilienceScore != null ? (data.resilienceScore >= 60 ? '#059669' : '#d97706') : '#94a3b8' }}>
                {data.resilienceScore != null ? (data.resilienceScore >= 60 ? '✅ You can recover' : '⚠ Stay focused') : ''}
              </p>
            </div>

            {/* 📈 Your Progress */}
            <div>
              <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                📈 Your Progress <InfoTip text="How much of your project is done so far." />
              </p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a', fontSize: 18 }}>
                {data.workCompletionPct != null ? `${data.workCompletionPct.toFixed(0)}%` : '—'}
              </p>
              <ProgressBar 
                pct={data.workCompletionPct ?? 0} 
                color={data.workCompletionPct >= 50 ? '#059669' : '#d97706'} 
              />
            </div>

            {/* ⏰ Time Left */}
            <div>
              <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                ⏰ Time Left <InfoTip text="Days remaining until your project deadline." />
              </p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a', fontSize: 18 }}>
                {data.daysLeft != null ? `${data.daysLeft} days` : '—'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                Due: {data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '—'}
              </p>
            </div>

            {/* 🧩 Task Difficulty (Complexity Capacity) */}
            <div>
              <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                🧩 Task Difficulty <InfoTip text="How complex your project is. Harder projects = fewer realistic tasks per day." />
              </p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a', fontSize: 18 }}>
                {data.complexityCapacity != null ? `${data.complexityCapacity.toFixed(1)} tasks/day` : '—'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                {data.complexityCapacity === 2.0 ? 'Easy project' : data.complexityCapacity === 1.5 ? 'Medium project' : 'Hard project'}
              </p>
            </div>

            {/* 🎒 Your Workload (Load Factor) */}
            <div>
              <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                🎒 Your Workload <InfoTip text="How many projects you're working on. More projects = less focus per project." />
              </p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a', fontSize: 18 }}>
                {data.loadFactor != null ? `${Math.round(data.loadFactor * 100)}% focus` : '—'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                {data.loadFactor === 1.0 ? '1 project' : data.loadFactor === 0.85 ? '2 projects' : data.loadFactor === 0.70 ? '3 projects' : '4+ projects'}
              </p>
            </div>
          </div>

          <div style={{ 
            marginTop: 16, 
            paddingTop: 12, 
            borderTop: '1px solid #e2e8f0',
            background: '#fff',
            padding: 12,
            borderRadius: 8
          }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>
              💡 <strong>Simple explanation:</strong> We look at your deadline, how many tasks are left, how hard your project is, and how many other projects you're working on. Then we give you a daily target that's realistic for your situation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Single Project Card ─────────────────────────────────────────────────────
function CardInner({ projectId, projectTitle, dueDate, onGoToProject, predictionData }) {
  const { token } = useAuth();
  const [data, setData] = useState(predictionData || null);
  const [loading, setLoading] = useState(!predictionData);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (predictionData) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/predictions/${projectId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const j = await r.json();
      if (j.success !== false) setData(j.prediction ?? j);
      else setError(j.message || 'Failed');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }, [projectId, token, predictionData]);

  useEffect(() => { load(); }, [load]);

  // Loading
  if (loading) return (
    <div style={S.card}>
      <div style={S.header}>
        <span style={S.title}>{projectTitle}</span>
        <span style={S.due}>Due {dueDate ? new Date(dueDate).toLocaleDateString() : '—'}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'24px 0', justifyContent: 'center' }}>
        <div style={S.spinner} /><span style={{ fontSize:13, color:'#94a3b8' }}>Getting your plan…</span>
      </div>
    </div>
  );

  // Error
  if (error) return (
    <div style={S.card}>
      <div style={S.header}>
        <span style={S.title}>{projectTitle}</span>
        <span style={S.due}>Due {dueDate ? new Date(dueDate).toLocaleDateString() : '—'}</span>
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize:24, marginBottom: 8 }}>😕</p>
        <p style={{ fontSize:13, color:'#ef4444', margin:0 }}>{error}</p>
        <button onClick={load} style={{ ...S.retryBtn, marginTop: 12 }}>Try again</button>
      </div>
    </div>
  );

  // Cold Start
  if (data?.coldStart || data?.newProjectPending) return (
    <div style={S.card}>
      <div style={S.header}>
        <span style={S.title}>{projectTitle}</span>
        <span style={S.due}>Due {dueDate ? new Date(dueDate).toLocaleDateString() : '—'}</span>
      </div>
      <ColdStart needed={4} done={data?.dataPointsUsed || 0} />
    </div>
  );

  // ── Main Card Content ─────────────────────────────────────────────────────
  const rapStatus = data?.rapStatus || data?.status || 'not-started';
  const cfg = RAP[rapStatus] || RAP['not-started'];
  const confPct = Math.round((data?.confidence || 0) * 100);

  return (
    <div style={{ ...S.card, borderTop: `4px solid ${cfg.color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>

      {/* Header with Status Badge */}
      <div style={S.header}>
        <div>
          <span style={S.title}>{projectTitle}</span>
          <span style={S.due}>📅 Due {dueDate ? new Date(dueDate).toLocaleDateString() : '—'}</span>
        </div>
        <span style={{ 
          ...S.badge, 
          background: cfg.bg, 
          color: cfg.color,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px'
        }}>
          <span style={{ fontSize: 14 }}>{cfg.icon}</span> {cfg.label}
        </span>
      </div>

      {/* Main Content */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* 🎯 Today's Target - BIG and Clear */}
        {data?.dailyTarget != null && data.dailyTarget > 0 && (
          <div style={{ 
            padding: '18px', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #fff 100%)',
            borderRadius: 12,
            border: `1px solid #e2e8f0`,
            textAlign: 'center'
          }}>
            <p style={{ margin:0, fontSize:12, color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing: '0.5px' }}>
              🎯 Your Goal Today
            </p>
            <p style={{ margin:'8px 0 0', fontSize:36, fontWeight:800, color:'#0f172a', lineHeight: 1 }}>
              {data.dailyTarget}
              <span style={{ fontSize:16, fontWeight:400, color:'#64748b', marginLeft: 4 }}>tasks</span>
            </p>
            {data?.deadlinePressure != null && (
              <p style={{ margin:'8px 0 0', fontSize:12, color:'#94a3b8' }}>
                (You need ~{data.deadlinePressure.toFixed(1)} tasks/day to finish on time)
              </p>
            )}
          </div>
        )}

        {/* 💬 Action Message - Friendly and Encouraging */}
        {data?.rapMessage && data.rapMessage.trim() && (
          <div style={{ 
            padding:'16px', 
            background: cfg.bg, 
            borderRadius: 12, 
            border: `1px solid ${cfg.color}33`,
          }}>
            <p style={{ margin:0, fontSize:14, fontWeight:500, color:cfg.color, lineHeight:1.6 }}>
              {data.rapMessage}
            </p>
          </div>
        )}

        {/* 🧠 Recovery Power + 🎯 Confidence - Side by Side */}
        <div style={{ display:'flex', gap:16 }}>
          {data?.resilienceScore != null && (
            <div style={{ flex:1, padding: '14px', background: '#f8fafc', borderRadius: 10 }}>
              <p style={{ margin:0, fontSize:11, color:'#64748b', fontWeight:600, textTransform:'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                🧠 Recovery Power <InfoTip text="How well you can catch up if you fall behind. 60+ = you have buffer to recover." />
              </p>
              <p style={{ margin:'4px 0 0', fontSize:20, fontWeight:700, color: data.resilienceScore >= 60 ? '#059669' : '#d97706' }}>
                {data.resilienceScore}/100
              </p>
              <p style={{ margin:'2px 0 0', fontSize:11, color: data.resilienceScore >= 60 ? '#059669' : '#d97706', fontWeight: 500 }}>
                {data.resilienceScore >= 60 ? '✅ You can catch up' : '⚠ Focus on today'}
              </p>
            </div>
          )}
          <div style={{ flex:1, padding: '14px', background: '#f8fafc', borderRadius: 10 }}>
            <p style={{ margin:0, fontSize:11, color:'#64748b', fontWeight:600, textTransform:'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
              🎯 How Sure We Are <InfoTip text="Based on your recent activity. More data = more confidence." />
            </p>
            <div style={{ marginTop:6 }}><ProgressBar pct={confPct} color={confPct >= 70 ? '#059669' : confPct >= 40 ? '#d97706' : '#94a3b8'} /></div>
            <p style={{ margin:'4px 0 0', fontSize:11, fontWeight:700, color:'#0f172a', textAlign:'right' }}>{confPct}% sure</p>
          </div>
        </div>

        {/* 🔍 Prediction Details (Collapsible) - NOW INCLUDES ALL 6 FACTORS */}
        <PredictionFactors data={data} />

      </div>

      {/* Go to Project Button */}
      {onGoToProject && (
        <button 
          onClick={() => onGoToProject(projectId)} 
          style={{
            ...S.primaryBtn,
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '12px'
          }}
        >
          Open Project →
        </button>
      )}
    </div>
  );
}

// ── Export Component (Single or All Projects) ─────────────────────────────
export default function RAPPredictionCard({ 
  projectId, 
  projectTitle, 
  dueDate, 
  onGoToProject, 
  allProjects = false,
  projects = null
}) {
  const { token } = useAuth();
  const [localProjects, setLocalProjects] = useState(projects || []);
  const [loading, setLoading] = useState(allProjects && !projects);

  // Load projects if not provided
  useEffect(() => {
    if (!allProjects || projects) return;
    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/user/dashboard-summary`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const j = await r.json();
        if (j.success && j.dashboard?.projects) {
          setLocalProjects(j.dashboard.projects);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [allProjects, token, projects]);

  // Loading
  if (allProjects && loading) return (
    <div style={{ display:'flex', gap:8, alignItems:'center', padding:'24px 0', justifyContent: 'center' }}>
      <div style={S.spinner} /><span style={{ fontSize:13, color:'#94a3b8' }}>Getting your predictions…</span>
    </div>
  );

  // All projects view
  if (allProjects) {
    const projectsToRender = projects || localProjects;
    if (!projectsToRender?.length) return (
      <div style={{ textAlign:'center', padding:'40px 24px', background:'#fff', borderRadius:16, border:'1px solid #f1f5f9' }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
        <p style={{ margin:0, fontSize:15, color:'#0f172a', fontWeight: 600 }}>No active projects yet</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Create a project to get your personalized plan!</p>
      </div>
    );
    return (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px,1fr))', gap:16 }}>
        {projectsToRender.map(p => (
          <CardInner 
            key={p.projectId} 
            projectId={p.projectId} 
            projectTitle={p.title}
            dueDate={p.dueDate} 
            onGoToProject={onGoToProject}
            predictionData={{
              rapStatus: p.rapStatus || p.status || 'not-started',
              status: p.predictionStatus || p.status,
              dailyTarget: p.dailyTarget ?? 0,
              deadlinePressure: p.deadlinePressure ?? null,
              resilienceScore: p.resilienceScore ?? null,
              trajectoryScore: p.trajectoryScore ?? null,
              confidence: p.confidence ?? 0.7,
              rapMessage: p.rapMessage || '',
              workCompletionPct: p.workCompletionPct ?? (p.totalTasks > 0 ? (p.completedTasks / p.totalTasks) * 100 : 0),
              daysLeft: p.daysLeft ?? (p.dueDate ? Math.ceil((new Date(p.dueDate) - new Date()) / 86400000) : 0),
              complexityCapacity: p.complexityCapacity ?? null,
              loadFactor: p.loadFactor ?? null,
              dueDate: p.dueDate,
              coldStart: p.coldStart || false,
              newProjectPending: p.newProjectPending || false,
              dataPointsUsed: p.dataPointsUsed || 4,
            }}
          />
        ))}
      </div>
    );
  }

  // Single project view
  return <CardInner projectId={projectId} projectTitle={projectTitle} dueDate={dueDate} onGoToProject={onGoToProject} />;
}

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    border: '1px solid #f1f5f9',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #f1f5f9',
  },
  title: {
    display: 'block',
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.3,
  },
  due: {
    display: 'block',
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  badge: {
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 99,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  retryBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  primaryBtn: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  spinner: {
    width: 20,
    height: 20,
    border: '2px solid #e2e8f0',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};