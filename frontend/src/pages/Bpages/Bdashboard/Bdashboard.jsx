// components/Bdashboard.jsx — FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config/api';
import BDailyTargets from '../BDailyTargets';
import BPredictionCard from '../../../components/Bcomponents/BPredictionCard';

// ── API helper ────────────────────────────────────────────────────────────────
const api = (path, token) =>
  fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then(r => r.json());

// ── Greeting ──────────────────────────────────────────────────────────────────
function Greeting({ name }) {
  const hour = new Date().getHours();
  const text = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  return (
    <div style={styles.greeting}>
      <div>
        <h1 style={styles.greetingTitle}>{text}, {name} 👋</h1>
        <p style={styles.greetingDate}>{today}</p>
      </div>
    </div>
  );
}

// ── Stats bar — UPDATED to show target summary ───────────────────────────────
function StatsBar({ stats, targetSummary, totalProjects, totalTasks }) {
  const items = [
    { label: 'Open Projects', value: totalProjects ?? stats?.openProjects ?? '—', icon: '📁', color: '#3b82f6' },
    { label: 'Total Tasks', value: totalTasks ?? stats?.newTasks ?? '—', icon: '📋', color: '#f59e0b' },
    // ✅ NEW: Show RAP target summary
    { label: 'Targets Met', value: targetSummary?.met ?? '—', icon: '✅', color: '#059669' },
    { label: 'Targets Missed', value: targetSummary?.missed ?? '—', icon: '⚠️', color: '#dc2626' },
  ];
  return (
    <div style={styles.statsBar}>
      {items.map(item => (
        <div key={item.label} style={styles.statCard}>
          <span style={styles.statIcon}>{item.icon}</span>
          <span style={{ ...styles.statValue, color: item.color }}>{item.value}</span>
          <span style={styles.statLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Active tasks list ─────────────────────────────────────────────────────────
function ActiveTasks({ tasks, onGoToProject }) {
  if (!tasks?.length) return null;
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>⚡ My Active Tasks</h2>
      <div style={styles.taskList}>
        {tasks.map((task, i) => (
          <div key={task._id || i} style={styles.taskRow}>
            <div style={styles.orderBadge}>#{task.order ?? i + 1}</div>
            <div style={styles.taskInfo}>
              <p style={styles.taskName}>{task.name}</p>
              <p style={styles.taskProject}>{task.projectTitle}</p>
            </div>
            <span style={{
              ...styles.statusChip,
              background: task.status === 'In Progress' ? '#eff6ff' : '#f8fafc',
              color: task.status === 'In Progress' ? '#3b82f6' : '#94a3b8',
            }}>
              {task.status === 'In Progress' ? '▶ In Progress' : '● New'}
            </span>
            <button onClick={() => onGoToProject(task.projectId)} style={styles.taskGoBtn}>→</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard — CORRECTED VERSION ───────────────────────────────────────
export default function Bdashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // ✅ Store full dashboard response (not transformed)
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('targets');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Call the route you defined: /api/user/dashboard-summary
      const data = await api('/api/user/dashboard-summary', token);
      
      if (data.success) {
        // ✅ Store the full dashboard object (includes projects array!)
        setDashboardData(data.dashboard);
      } else {
        setError(data.message || 'Failed to load');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleGoToProject = (projectId) =>
    navigate(`/user/projects/${projectId}`);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={styles.loadingScreen}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading dashboard…</p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div style={styles.errorScreen}>
      <p style={styles.errorText}>⚠ {error}</p>
      <button onClick={fetchDashboard} style={styles.retryBtn}>Retry</button>
    </div>
  );

  // ── Empty State ────────────────────────────────────────────────────────────
  if (!dashboardData || !dashboardData.projects?.length) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <Greeting name={user?.name || 'Student'} />
          <div style={{ ...styles.card, textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>
              No Active Projects
            </p>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>
              Create a project or join one to see your dashboard.
            </p>
            <button onClick={() => navigate('/user/createproject')} style={styles.navBtn}>
              + Create Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Greeting */}
        <Greeting name={user?.name || 'Student'} />

        {/* Stats — UPDATED with target summary */}
        <StatsBar 
          stats={{}}  // Not used anymore, but kept for compatibility
          targetSummary={dashboardData?.targetSummary}
          totalProjects={dashboardData?.totalProjects}
          totalTasks={dashboardData?.totalTasks}
        />

        {/* Tab switcher */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'targets' ? styles.tabActive : {}) }}
            onClick={() => setTab('targets')}
          >
            📅 Daily Targets
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'predictions' ? styles.tabActive : {}) }}
            onClick={() => setTab('predictions')}
          >
            📊 Predictions
          </button>
        </div>

        {/* Tab content — FIXED: Pass projects prop */}
        {tab === 'targets' && (
          <BDailyTargets 
            projects={dashboardData?.projects}  // ✅ FIXED: Pass projects!
            onGoToProject={handleGoToProject}
          />
        )}

        {tab === 'predictions' && (
          // ✅ FIXED: Pass projects so card doesn't fetch separately
          <BPredictionCard
            allProjects
            projects={dashboardData?.projects}  // ✅ Pass pre-fetched data
            onGoToProject={handleGoToProject}
          />
        )}

        {/* Active tasks — Note: backend doesn't send detailed tasks, so show empty or fetch separately */}
        <ActiveTasks
          tasks={[]}  // Backend doesn't include detailed tasks in this endpoint
          onGoToProject={handleGoToProject}
        />

        

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '24px 16px',
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  greeting: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  greetingDate: {
    fontSize: 14,
    color: '#64748b',
    margin: '4px 0 0',
  },
  statsBar: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: '1 1 140px',
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    minWidth: 120,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 28, fontWeight: 700 },
  statLabel: { fontSize: 13, color: '#64748b' },
  tabs: {
    display: 'flex',
    gap: 8,
    background: '#fff',
    borderRadius: 12,
    padding: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderRadius: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: '#64748b',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    background: '#eff6ff',
    color: '#3b82f6',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  taskList: {
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  taskRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    gap: 12,
  },
  orderBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    width: 28,
    flexShrink: 0,
  },
  taskInfo: {
    flex: 1,
    minWidth: 0,
  },
  taskName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  taskProject: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '2px 0 0',
  },
  statusChip: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 9px',
    borderRadius: 99,
    flexShrink: 0,
  },
  taskGoBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    width: 30,
    height: 30,
    cursor: 'pointer',
    fontSize: 16,
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
  },
  quickNav: {
    display: 'flex',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  navBtnOutline: {
    flex: 1,
    background: '#fff',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: 10,
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  loadingScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: '#64748b', fontSize: 14 },
  errorScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 12,
  },
  errorText: { color: '#ef4444', fontSize: 15 },
  retryBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
};