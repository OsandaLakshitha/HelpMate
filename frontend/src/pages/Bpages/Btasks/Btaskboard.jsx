import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Box, Typography, Paper, Chip, Button, CircularProgress,
  Alert, IconButton, Collapse, LinearProgress,
  Menu, MenuItem,
} from '@mui/material';
import ArrowBackIcon            from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon           from '@mui/icons-material/ExpandMore';
import ExpandLessIcon           from '@mui/icons-material/ExpandLess';
import CheckCircleIcon          from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LockIcon                 from '@mui/icons-material/Lock';
import YouTubeIcon              from '@mui/icons-material/YouTube';
import AutoAwesomeIcon          from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownIcon    from '@mui/icons-material/KeyboardArrowDown';
import FolderOpenIcon           from '@mui/icons-material/FolderOpen';
import TaskAltIcon              from '@mui/icons-material/TaskAlt';
import PendingActionsIcon       from '@mui/icons-material/PendingActions';
import LockClockIcon            from '@mui/icons-material/LockClock';
import EmojiEventsIcon          from '@mui/icons-material/EmojiEvents';

const C = {
  bg:          '#F0F2FA',
  surface:     '#FFFFFF',
  border:      '#E4E7EF',
  primary:     '#4361EE',
  primarySoft: '#EEF1FD',
  text:        '#1A1D2E',
  muted:       '#6B7280',
  success:     '#16A34A',
  successSoft: '#DCFCE7',
  warning:     '#D97706',
  warningSoft: '#FEF3C7',
  error:       '#DC2626',
  errorSoft:   '#FEE2E2',
};

const CX = {
  1: { label: 'Very Easy', color: '#16A34A', bg: '#DCFCE7' },
  2: { label: 'Easy',      color: '#2563EB', bg: '#DBEAFE' },
  3: { label: 'Medium',    color: '#D97706', bg: '#FEF3C7' },
  4: { label: 'Hard',      color: '#DC2626', bg: '#FEE2E2' },
  5: { label: 'Very Hard', color: '#7C3AED', bg: '#EDE9FE' },
};

// Task Summary strip — replaces the old prediction banner
const TaskSummary = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null;

  const completed     = tasks.filter(t => t.status === 'Completed').length;
  const total         = tasks.length;
  const pending       = tasks.filter(t => t.status !== 'Completed').length;
  const firstPendIdx  = tasks.findIndex(t => t.status !== 'Completed');
  const current       = firstPendIdx !== -1 ? tasks[firstPendIdx] : null;
  const locked        = Math.max(0, pending - (current ? 1 : 0));
  const pct           = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone       = completed === total && total > 0;

  const stats = [
    { icon: <TaskAltIcon sx={{ fontSize: 20, color: C.success }} />,         value: completed,            label: 'Completed',   color: C.success,  bg: C.successSoft },
    { icon: <PendingActionsIcon sx={{ fontSize: 20, color: C.primary }} />,  value: current ? 1 : 0,      label: 'In Progress', color: C.primary,  bg: C.primarySoft },
    { icon: <LockClockIcon sx={{ fontSize: 20, color: C.muted }} />,         value: locked,               label: 'Locked',      color: C.muted,    bg: '#F3F4F6'     },
    { icon: <EmojiEventsIcon sx={{ fontSize: 20, color: C.warning }} />,     value: `${pct}%`,            label: 'Progress',    color: C.warning,  bg: C.warningSoft },
  ];

  return (
    <Paper elevation={0} sx={{ border: `1.5px solid ${C.border}`, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${C.border}` }}>
        {stats.map((s, i) => (
          <Box key={i} sx={{
            px: 2, py: 2,
            display: 'flex', alignItems: 'center', gap: 1.2,
            borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </Box>
            <Box>
              <Typography fontSize={20} fontWeight={800} color={s.color} lineHeight={1}>{s.value}</Typography>
              <Typography fontSize={10.5} color={C.muted} fontWeight={600} letterSpacing={0.3}>{s.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2.5, py: 2, bgcolor: '#FAFBFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography fontSize={11.5} fontWeight={600} color={C.text}>Overall Progress</Typography>
          <Typography fontSize={11.5} fontWeight={700} color={pct === 100 ? C.success : C.primary}>
            {completed} / {total} tasks
          </Typography>
        </Box>

        <LinearProgress variant="determinate" value={pct} sx={{
          height: 8, borderRadius: 4, bgcolor: C.border,
          '& .MuiLinearProgress-bar': {
            bgcolor: pct === 100 ? C.success : C.primary,
            borderRadius: 4,
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          },
        }} />

        <Box sx={{ mt: 1.2 }}>
          {allDone ? (
            <Typography fontSize={12} color={C.success} fontWeight={700}>🎉 All tasks completed — great work!</Typography>
          ) : current ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%', bgcolor: C.primary, flexShrink: 0,
                animation: 'pulse 1.6s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%,100%': { opacity: 1, transform: 'scale(1)' },
                  '50%':     { opacity: 0.5, transform: 'scale(1.5)' },
                },
              }} />
              <Typography fontSize={11.5} color={C.muted}>
                Up next:{' '}
                <Box component="span" fontWeight={700} color={C.primary}>{current.name || current.title}</Box>
              </Typography>
            </Box>
          ) : (
            <Typography fontSize={11.5} color={C.muted}>Complete tasks in order to unlock the next one</Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const TaskCard = ({ task, state, onComplete, index }) => {
  const [open,       setOpen]       = useState(false);
  const [completing, setCompleting] = useState(false);

  const cx          = CX[task.complexity] || CX[3];
  const isCompleted = state === 'completed';
  const isCurrent   = state === 'current';
  const isLocked    = state === 'locked';

  const handleComplete = async () => {
    if (!isCurrent || completing) return;
    setCompleting(true);
    await onComplete(task._id);
    setCompleting(false);
  };

  return (
    <Paper elevation={0} sx={{
      borderRadius: 2.5,
      border: `1.5px solid ${isCompleted ? '#BBF7D0' : isCurrent ? C.primary : C.border}`,
      bgcolor: isCompleted ? '#F0FDF4' : isCurrent ? '#F8F9FF' : C.surface,
      overflow: 'hidden',
      opacity: isLocked ? 0.5 : 1,
      transition: 'all 0.2s ease',
      animation: `slideIn 0.3s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
      '@keyframes slideIn': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      '&:hover': !isLocked ? { boxShadow: `0 4px 16px rgba(67,97,238,0.08)`, transform: 'translateY(-1px)' } : {},
    }}>
      <Box sx={{ height: 3, bgcolor: isCompleted ? C.success : isCurrent ? C.primary : C.border }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0, mt: 0.3 }}>
            <Box onClick={isCurrent && !completing ? handleComplete : undefined} sx={{
              cursor: isCurrent ? 'pointer' : 'default',
              color: isCompleted ? C.success : isCurrent ? C.primary : '#D1D5DB',
              transition: 'all 0.15s',
              '&:hover': isCurrent ? { color: C.success, transform: 'scale(1.15)' } : {},
            }}>
              {completing
                ? <CircularProgress size={20} sx={{ color: C.success }} />
                : isCompleted
                  ? <CheckCircleIcon sx={{ fontSize: 22 }} />
                  : isLocked
                    ? <LockIcon sx={{ fontSize: 20 }} />
                    : <RadioButtonUncheckedIcon sx={{ fontSize: 22 }} />
              }
            </Box>
            <Typography fontSize={10} fontWeight={700} color={isCompleted ? C.success : isCurrent ? C.primary : C.muted}>
              #{task.order ?? index + 1}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
              <Typography fontWeight={600} fontSize={13.5}
                color={isCompleted ? C.muted : isLocked ? C.muted : C.text}
                sx={{ textDecoration: isCompleted ? 'line-through' : 'none', lineHeight: 1.4 }}>
                {task.name || task.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexShrink: 0, alignItems: 'center' }}>
                <Chip label={cx.label} size="small" sx={{ bgcolor: isLocked ? '#F3F4F6' : cx.bg, color: isLocked ? C.muted : cx.color, fontWeight: 700, fontSize: 9.5, height: 18, px: 0.3 }} />
                {isCurrent && <Chip label="Current" size="small" sx={{ bgcolor: C.primarySoft, color: C.primary, fontWeight: 700, fontSize: 9.5, height: 18, px: 0.3 }} />}
              </Box>
            </Box>

            {task.description && (
              <Typography fontSize={12} color={C.muted} lineHeight={1.55} mb={1.2}>{task.description}</Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                {isCompleted && task.completedAt && (
                  <Typography fontSize={11} color={C.success} fontWeight={600}>
                    ✓ Done {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Typography>
                )}
                {isLocked && <Typography fontSize={11} color={C.muted}>🔒 Complete previous task first</Typography>}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isCurrent && (
                  <Button size="small" variant="contained" onClick={handleComplete} disabled={completing}
                    startIcon={completing ? null : <CheckCircleIcon sx={{ fontSize: 14 }} />}
                    sx={{ fontSize: 11, fontWeight: 700, px: 1.8, py: 0.6, borderRadius: 2, bgcolor: C.success, boxShadow: `0 2px 8px ${C.success}40`, '&:hover': { bgcolor: '#15803D' }, '&:disabled': { bgcolor: '#D1D5DB' } }}>
                    {completing ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Mark Complete'}
                  </Button>
                )}
                {(task.steps?.length > 0 || task.youtubeQueries?.length > 0) && (
                  <IconButton size="small" onClick={() => setOpen(p => !p)}
                    sx={{ width: 24, height: 24, border: `1px solid ${C.border}`, bgcolor: C.bg, '&:hover': { borderColor: C.primary } }}>
                    {open ? <ExpandLessIcon sx={{ fontSize: 13 }} /> : <ExpandMoreIcon sx={{ fontSize: 13 }} />}
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Collapse in={open}>
        <Box sx={{ mx: 2, mb: 2, borderRadius: 2, bgcolor: '#F8F9FE', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {task.steps?.length > 0 && (
            <Box sx={{ p: 1.8, borderBottom: task.youtubeQueries?.length ? `1px solid ${C.border}` : 'none' }}>
              <Typography fontSize={10} fontWeight={700} color={C.primary} textTransform="uppercase" letterSpacing={0.8} mb={1.2}>Steps</Typography>
              {task.steps.map((step, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.2, mb: 0.8 }}>
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, bgcolor: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography fontSize={8} fontWeight={800} color={C.primary}>{i + 1}</Typography>
                  </Box>
                  <Typography fontSize={12} color={C.text} lineHeight={1.55} pt={0.1}>{step}</Typography>
                </Box>
              ))}
            </Box>
          )}
          {task.youtubeQueries?.length > 0 && (
            <Box sx={{ p: 1.8 }}>
              <Typography fontSize={10} fontWeight={700} color={C.error} textTransform="uppercase" letterSpacing={0.8} mb={1}>Resources</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                {task.youtubeQueries.map((q, i) => (
                  <Box key={i} component="a"
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                    target="_blank" rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1.5, bgcolor: '#FFF0F0', border: '1px solid #FECACA', textDecoration: 'none', '&:hover': { bgcolor: '#FFE4E4' } }}>
                    <YouTubeIcon sx={{ fontSize: 12, color: '#DC2626' }} />
                    <Typography fontSize={11} color={C.text}>{q}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

const Btaskboard = () => {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const [projects,      setProjects]      = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [anchorEl,      setAnchorEl]      = useState(null);
  const [tasks,         setTasks]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [successMsg,    setSuccessMsg]    = useState('');

  const headers       = { Authorization: `Bearer ${token}` };
  const currentUserId = user?._id || user?.id;

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const res  = await axios.get(`${API_URL}/api/projects`, { headers });
      const list = res.data.projects || [];
      setProjects(list);
      const target = id ? list.find(p => p._id === id) || list[0] : list[0];
      if (target) { setActiveProject(target); await loadTasks(target._id); }
      else setLoading(false);
    } catch { setError('Failed to load projects'); setLoading(false); }
  };

  const loadTasks = async (projectId) => {
    setLoading(true); setError('');
    try {
      const taskRes = await axios.get(`${API_URL}/api/tasks`, { headers, params: { projectId } });
      const myTasks = (taskRes.data.tasks || [])
        .filter(t => String(t.assigneeId?._id || t.assigneeId) === String(currentUserId))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setTasks(myTasks);
    } catch { setError('Failed to load tasks'); }
    finally  { setLoading(false); }
  };

  const handleSwitchProject = async (project) => {
    setActiveProject(project); setAnchorEl(null); setSuccessMsg('');
    await loadTasks(project._id);
  };

  const handleComplete = async (taskId) => {
    try {
      await axios.put(`${API_URL}/api/tasks/${taskId}/complete`, {}, { headers });
      setTasks(prev => prev.map(t =>
        t._id === taskId ? { ...t, status: 'Completed', completedAt: new Date().toISOString() } : t
      ));
      setSuccessMsg('Task completed! 🎉');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark task complete');
    }
  };

  const getTaskState = (task, idx) => {
    if (task.status === 'Completed') return 'completed';
    const firstPending = tasks.findIndex(t => t.status !== 'Completed');
    return idx === firstPending ? 'current' : 'locked';
  };

  const totalCount = tasks.length;

  return (
    <Box sx={{ bgcolor: C.bg, minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 3 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="small" onClick={() => navigate(-1)}
              sx={{ border: `1px solid ${C.border}`, bgcolor: C.surface, '&:hover': { borderColor: C.primary } }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography fontWeight={800} fontSize={20} color={C.text} sx={{ letterSpacing: '-0.3px' }}>My Task Board</Typography>
              <Typography fontSize={12} color={C.muted}>Complete tasks in order — one at a time</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button variant="outlined"
              startIcon={<FolderOpenIcon sx={{ fontSize: 16 }} />}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ borderColor: C.border, color: C.text, fontWeight: 600, borderRadius: 2.5, px: 2, py: 0.9, fontSize: 13, bgcolor: C.surface, textTransform: 'none', '&:hover': { borderColor: C.primary, bgcolor: C.primarySoft } }}>
              {activeProject?.title
                ? activeProject.title.length > 24 ? activeProject.title.slice(0, 24) + '...' : activeProject.title
                : 'Select Project'}
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2.5, border: `1px solid ${C.border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', minWidth: 260, mt: 1 } }}>
              <Box sx={{ px: 2, py: 1.2, borderBottom: `1px solid ${C.border}` }}>
                <Typography fontSize={11} fontWeight={700} color={C.muted} textTransform="uppercase" letterSpacing={0.8}>Switch Project</Typography>
              </Box>
              {projects.length === 0
                ? <MenuItem disabled><Typography fontSize={13} color={C.muted}>No projects found</Typography></MenuItem>
                : projects.map(p => (
                  <MenuItem key={p._id} onClick={() => handleSwitchProject(p)} selected={activeProject?._id === p._id}
                    sx={{ px: 2, py: 1.5, gap: 1.5, '&.Mui-selected': { bgcolor: C.primarySoft }, '&:hover': { bgcolor: C.primarySoft } }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: p.status === 'Open' ? C.success : C.muted }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize={13} fontWeight={600} color={C.text} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</Typography>
                      <Typography fontSize={10.5} color={C.muted}>{p.status}</Typography>
                    </Box>
                    {activeProject?._id === p._id && <CheckCircleIcon sx={{ fontSize: 15, color: C.primary, flexShrink: 0 }} />}
                  </MenuItem>
                ))}
            </Menu>
          </Box>
        </Box>

        {error      && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>

        ) : !activeProject ? (
          <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, p: 6, textAlign: 'center' }}>
            <FolderOpenIcon sx={{ fontSize: 48, color: C.border, mb: 2 }} />
            <Typography fontWeight={700} fontSize={16} color={C.text} mb={1}>No projects yet</Typography>
            <Typography fontSize={13} color={C.muted} mb={3}>Create a project to get started</Typography>
            <Button variant="contained" onClick={() => navigate('/user/createproject')} sx={{ fontWeight: 700, borderRadius: 2, bgcolor: C.primary }}>Create Project</Button>
          </Paper>

        ) : (
          <>
            {/* Task Summary */}
            {totalCount > 0 && <TaskSummary tasks={tasks} />}

            {totalCount === 0 ? (
              <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, p: 6, textAlign: 'center' }}>
                <AutoAwesomeIcon sx={{ fontSize: 44, color: C.border, mb: 2 }} />
                <Typography fontWeight={700} fontSize={16} color={C.text} mb={1}>No tasks generated yet</Typography>
                <Typography fontSize={13} color={C.muted} mb={3}>Generate AI tasks for your component in this project</Typography>
                <Button variant="contained" startIcon={<AutoAwesomeIcon />}
                  onClick={() => navigate(`/user/generate-tasks/${activeProject._id}`)}
                  sx={{ fontWeight: 700, borderRadius: 2, bgcolor: C.primary, boxShadow: `0 4px 14px ${C.primary}40`, '&:hover': { bgcolor: '#3451d1' } }}>
                  Generate My Tasks
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {tasks.map((task, idx) => (
                  <TaskCard key={task._id} task={task} state={getTaskState(task, idx)} onComplete={handleComplete} index={idx} />
                ))}
              </Box>
            )}

            
          </>
        )}
      </Box>
    </Box>
  );
};

export default Btaskboard;