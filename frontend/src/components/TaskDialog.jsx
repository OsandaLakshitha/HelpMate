import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Paper, Grid, TextField, Chip, IconButton, Collapse,
  Divider, LinearProgress, Avatar,
} from '@mui/material';
import ArrowBackIcon      from '@mui/icons-material/ArrowBack';
import SaveIcon           from '@mui/icons-material/Save';
import AutoAwesomeIcon    from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon     from '@mui/icons-material/ExpandMore';
import ExpandLessIcon     from '@mui/icons-material/ExpandLess';
import YouTubeIcon        from '@mui/icons-material/YouTube';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon     from '@mui/icons-material/AccessTime';
import WarningAmberIcon   from '@mui/icons-material/WarningAmber';
import TrendingUpIcon     from '@mui/icons-material/TrendingUp';
import TrendingDownIcon   from '@mui/icons-material/TrendingDown';
import AddIcon            from '@mui/icons-material/Add';
import RemoveIcon         from '@mui/icons-material/Remove';
import AssignmentIcon     from '@mui/icons-material/Assignment';
import SpeedIcon          from '@mui/icons-material/Speed';

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#F7F8FC',
  surface:     '#FFFFFF',
  border:      '#E4E7EF',
  primary:     '#4361EE',
  primarySoft: '#EEF1FD',
  text:        '#1A1D2E',
  muted:       '#6B7280',
  success:     '#2DC76D',
  successSoft: '#EDFBF3',
  warning:     '#F59E0B',
  warningSoft: '#FFFBEB',
  error:       '#EF4444',
  errorSoft:   '#FFF0F0',
  purple:      '#8B5CF6',
  purpleSoft:  '#F5F3FF',
};

// ── Complexity config ─────────────────────────────────────────────────────────
const COMPLEXITY = {
  1: { label: 'Very Easy', color: '#2DC76D', bg: '#EDFBF3' },
  2: { label: 'Easy',      color: '#3B82F6', bg: '#EFF6FF' },
  3: { label: 'Medium',    color: '#F59E0B', bg: '#FFFBEB' },
  4: { label: 'Hard',      color: '#EF4444', bg: '#FFF0F0' },
  5: { label: 'Very Hard', color: '#8B5CF6', bg: '#F5F3FF' },
};

// ── Prediction status config ──────────────────────────────────────────────────
const PRED_STATUS = {
  'on-track':    { label: 'On Track',    color: C.success, bg: C.successSoft },
  'at-risk':     { label: 'At Risk',     color: C.warning, bg: C.warningSoft },
  'in-danger':   { label: 'In Danger',   color: C.error,   bg: C.errorSoft   },
  'not-started': { label: 'Not Started', color: C.muted,   bg: '#F3F4F6'     },
  'complete':    { label: 'Complete',    color: C.purple,  bg: C.purpleSoft  },
};

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ icon, title, subtitle, children }) => (
  <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
    <Box sx={{ px: 3, py: 2, bgcolor: C.bg, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: C.primary }}>{icon}</Box>
      <Box>
        <Typography fontWeight={700} fontSize={15} color={C.text}>{title}</Typography>
        {subtitle && <Typography fontSize={12} color={C.muted}>{subtitle}</Typography>}
      </Box>
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

// ── Hours stepper ─────────────────────────────────────────────────────────────
const Stepper = ({ value, onChange, color = C.primary }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <IconButton size="small" onClick={() => onChange(Math.max(0.5, Math.round((value - 0.5) * 10) / 10))}
      disabled={value <= 0.5}
      sx={{ width: 32, height: 32, border: `1px solid ${C.border}`, bgcolor: C.surface,
        '&:hover': { borderColor: color }, '&:disabled': { opacity: 0.3 } }}>
      <RemoveIcon sx={{ fontSize: 14 }} />
    </IconButton>
    <Box sx={{ textAlign: 'center', minWidth: 52 }}>
      <Typography fontWeight={800} fontSize={22} color={color} sx={{ lineHeight: 1 }}>{value}</Typography>
      <Typography fontSize={10} color={C.muted}>hrs/day</Typography>
    </Box>
    <IconButton size="small" onClick={() => onChange(Math.min(18, Math.round((value + 0.5) * 10) / 10))}
      disabled={value >= 18}
      sx={{ width: 32, height: 32, border: `1px solid ${C.border}`, bgcolor: C.surface,
        '&:hover': { borderColor: color }, '&:disabled': { opacity: 0.3 } }}>
      <AddIcon sx={{ fontSize: 14 }} />
    </IconButton>
  </Box>
);

// ── Task card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);
  const cx = COMPLEXITY[task.complexity] || COMPLEXITY[3];
  const isNew       = task.status === 'New';
  const isCompleted = task.status === 'Completed';

  const daysLeft = task.dueDate
    ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(task._id);
    setCompleting(false);
  };

  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${isCompleted ? C.success : C.border}`,
      borderRadius: 2.5,
      overflow: 'hidden',
      opacity: isCompleted ? 0.75 : 1,
      transition: 'all 0.2s',
    }}>
      {/* Task header */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Status icon */}
          <Box sx={{ mt: 0.3, color: isCompleted ? C.success : C.border, flexShrink: 0 }}>
            {isCompleted
              ? <CheckCircleIcon sx={{ fontSize: 22 }} />
              : <RadioButtonUncheckedIcon sx={{ fontSize: 22 }} />
            }
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography fontWeight={700} fontSize={14} color={isCompleted ? C.muted : C.text}
                sx={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                {task.title}
              </Typography>
              <Chip label={cx.label} size="small"
                sx={{ bgcolor: cx.bg, color: cx.color, fontWeight: 700, fontSize: 10, height: 20 }} />
            </Box>

            <Typography fontSize={13} color={C.muted} lineHeight={1.5} mb={1}>
              {task.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* Due date */}
              {task.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 13, color: daysLeft !== null && daysLeft < 3 ? C.error : C.muted }} />
                  <Typography fontSize={12} color={daysLeft !== null && daysLeft < 3 ? C.error : C.muted}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {daysLeft !== null && (
                      <Box component="span" fontWeight={700} ml={0.5}>
                        {daysLeft > 0 ? `· ${daysLeft}d left` : daysLeft === 0 ? '· Today' : `· ${Math.abs(daysLeft)}d overdue`}
                      </Box>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Estimated hours */}
              <Typography fontSize={12} color={C.muted}>~{task.estimatedHours} hrs</Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {isNew && (
              <Button size="small" variant="contained" onClick={handleComplete} disabled={completing}
                sx={{
                  fontSize: 12, fontWeight: 700, borderRadius: 2,
                  bgcolor: C.success, '&:hover': { bgcolor: '#24a85a' },
                  minWidth: 110,
                }}>
                {completing
                  ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                  : '✓ Mark Done'
                }
              </Button>
            )}
            <IconButton size="small" onClick={() => setExpanded(p => !p)}
              sx={{ border: `1px solid ${C.border}`, width: 30, height: 30 }}>
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Expanded details */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2.5, bgcolor: C.bg }}>
          {/* Steps */}
          {task.steps?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography fontSize={12} fontWeight={700} color={C.muted} textTransform="uppercase"
                letterSpacing={0.8} mb={1}>
                Steps
              </Typography>
              {task.steps.map((step, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                  <Box sx={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    bgcolor: C.primarySoft, border: `1px solid ${C.primary}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography fontSize={10} fontWeight={700} color={C.primary}>{i + 1}</Typography>
                  </Box>
                  <Typography fontSize={13} color={C.text} lineHeight={1.6}>{step}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* YouTube links */}
          {task.youtubeQueries?.length > 0 && (
            <Box>
              <Typography fontSize={12} fontWeight={700} color={C.muted} textTransform="uppercase"
                letterSpacing={0.8} mb={1}>
                Learning Resources
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {task.youtubeQueries.map((q, i) => (
                  <Box
                    key={i}
                    component="a"
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.8,
                      px: 1.5, py: 0.8, borderRadius: 2,
                      bgcolor: '#FFF0F0', border: '1px solid #FECACA',
                      textDecoration: 'none',
                      '&:hover': { bgcolor: '#FFE4E4' },
                    }}
                  >
                    <YouTubeIcon sx={{ fontSize: 14, color: '#EF4444' }} />
                    <Typography fontSize={12} color={C.text}>{q}</Typography>
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

// ── Prediction card ───────────────────────────────────────────────────────────
const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;
  const ps = PRED_STATUS[prediction.status] || PRED_STATUS['not-started'];

  return (
    <Paper elevation={0} sx={{
      border: `2px solid ${ps.color}30`,
      borderRadius: 3, overflow: 'hidden', mb: 3,
    }}>
      <Box sx={{ px: 3, py: 2, bgcolor: ps.bg, borderBottom: `1px solid ${ps.color}20`,
        display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SpeedIcon sx={{ color: ps.color }} />
        <Typography fontWeight={700} fontSize={15} color={ps.color}>My Prediction</Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Score */}
          <Grid item xs={6} sm={3}>
            <Typography fontSize={11} color={C.muted} mb={0.5}>Completion Score</Typography>
            <Typography fontWeight={800} fontSize={32} color={ps.color} sx={{ lineHeight: 1 }}>
              {prediction.completionScore?.toFixed(0) ?? '—'}
            </Typography>
            <Typography fontSize={10} color={C.muted}>out of 100</Typography>
          </Grid>

          {/* Status */}
          <Grid item xs={6} sm={3}>
            <Typography fontSize={11} color={C.muted} mb={0.5}>Status</Typography>
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 5, bgcolor: ps.bg, border: `1px solid ${ps.color}`,
              display: 'inline-block' }}>
              <Typography fontSize={12} fontWeight={700} color={ps.color}>{ps.label}</Typography>
            </Box>
          </Grid>

          {/* Days left */}
          <Grid item xs={6} sm={3}>
            <Typography fontSize={11} color={C.muted} mb={0.5}>Days Left</Typography>
            <Typography fontWeight={700} fontSize={20} color={C.text}>
              {prediction.daysLeft ?? '—'}
            </Typography>
            <Typography fontSize={10} color={C.muted}>days</Typography>
          </Grid>

          {/* Pace */}
          <Grid item xs={6} sm={3}>
            <Typography fontSize={11} color={C.muted} mb={0.5}>Pace</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {prediction.paceDelta > 0
                ? <TrendingUpIcon sx={{ fontSize: 18, color: C.success }} />
                : <TrendingDownIcon sx={{ fontSize: 18, color: C.error }} />
              }
              <Typography fontWeight={700} fontSize={14}
                color={prediction.paceDelta > 0 ? C.success : C.error}>
                {prediction.paceDelta > 0 ? `+${prediction.paceDelta?.toFixed(1)}` : prediction.paceDelta?.toFixed(1)}%
              </Typography>
            </Box>
            <Typography fontSize={10} color={C.muted}>vs expected</Typography>
          </Grid>
        </Grid>

        {/* Confidence bar */}
        {prediction.confidence !== undefined && (
          <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${C.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography fontSize={11} color={C.muted}>Prediction Confidence</Typography>
              <Typography fontSize={11} fontWeight={700} color={C.text}>
                {(prediction.confidence * 100).toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={prediction.confidence * 100}
              sx={{ height: 5, borderRadius: 3, bgcolor: C.border,
                '& .MuiLinearProgress-bar': { bgcolor: ps.color, borderRadius: 3 } }} />
            {prediction.confidence < 0.5 && (
              <Typography fontSize={11} color={C.muted} mt={0.5}>
                Complete more tasks to improve confidence
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const TaskDialog = () => {
  const { id }          = useParams();   // projectId
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [project,    setProject]    = useState(null);
  const [member,     setMember]     = useState(null);   // my BProjectMember record
  const [tasks,      setTasks]      = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [workload,   setWorkload]   = useState(null);

  // ── Setup form state ───────────────────────────────────────────────────────
  const [individualPart, setIndividualPart] = useState('');
  const [weekdays,       setWeekdays]       = useState(2);
  const [weekends,       setWeekends]       = useState(4);
  const [setupSaved,     setSetupSaved]     = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [pageLoading,     setPageLoading]     = useState(true);
  const [setupLoading,    setSetupLoading]    = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [workloadLoading, setWorkloadLoading] = useState(false);
  const [error,           setError]           = useState('');
  const [setupError,      setSetupError]      = useState('');
  const [setupSuccess,    setSetupSuccess]    = useState('');
  const [genError,        setGenError]        = useState('');

  // ── Fetch everything on load ───────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setPageLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const currentUserId = user._id || user.id;

      // Project details
      const projRes = await axios.get(`${API_URL}/api/projects/${id}`, { headers });
      const { project: p, members: m } = projRes.value?.data || projRes.data;
      setProject(p || projRes.data?.project);

      // Find my member record
      const allMembers = projRes.data?.members || [];
      const me = allMembers.find(mb =>
        String(mb.userId?._id || mb.userId) === String(currentUserId)
      );
      if (me) {
        setMember(me);
        setIndividualPart(me.individualPart || '');
        if (me.availableTime?.weekdays) setWeekdays(me.availableTime.weekdays);
        if (me.availableTime?.weekends) setWeekends(me.availableTime.weekends);
        setSetupSaved(!!me.individualPart);
      }

      // My tasks
      const taskRes = await axios.get(`${API_URL}/api/tasks`, {
        headers, params: { projectId: id },
      });
      setTasks(taskRes.data.tasks || []);

      // My prediction
      try {
        const predRes = await axios.get(`${API_URL}/api/prediction/${id}`, { headers });
        setPrediction(predRes.data.prediction || null);
      } catch { /* no prediction yet is fine */ }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspace');
    } finally {
      setPageLoading(false);
    }
  };

  // ── Save setup (individual part + time) ───────────────────────────────────
  const handleSaveSetup = async () => {
    if (!individualPart.trim()) {
      setSetupError('Please describe your individual component');
      return;
    }
    setSetupLoading(true);
    setSetupError('');
    setSetupSuccess('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await Promise.all([
        axios.put(`${API_URL}/api/members/${id}/part`, { individualPart }, { headers }),
        axios.put(`${API_URL}/api/members/${id}/time`, { weekdays, weekends }, { headers }),
      ]);
      setSetupSaved(true);
      setSetupSuccess('Setup saved successfully!');
      setTimeout(() => setSetupSuccess(''), 3000);
      // Refresh workload check
      fetchWorkload();
    } catch (err) {
      setSetupError(err.response?.data?.message || 'Failed to save setup');
    } finally {
      setSetupLoading(false);
    }
  };

  // ── Workload check ─────────────────────────────────────────────────────────
  const fetchWorkload = async () => {
    setWorkloadLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/members/${id}/workload`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkload(res.data);
    } catch { /* non-fatal */ }
    finally { setWorkloadLoading(false); }
  };

  useEffect(() => {
    if (setupSaved) fetchWorkload();
  }, [setupSaved]);

  // ── Generate tasks ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenError('');
    setGenerateLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/tasks/generate`,
        { projectId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data.tasks || []);
      // Refresh prediction
      try {
        const predRes = await axios.get(`${API_URL}/api/prediction/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrediction(predRes.data.prediction || null);
      } catch { /* ok */ }
    } catch (err) {
      setGenError(err.response?.data?.message || 'Failed to generate tasks. Please try again.');
    } finally {
      setGenerateLoading(false);
    }
  };

  // ── Mark task complete ─────────────────────────────────────────────────────
  const handleCompleteTask = async (taskId) => {
    try {
      await axios.put(`${API_URL}/api/tasks/${taskId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update task in list
      setTasks(prev => prev.map(t =>
        t._id === taskId ? { ...t, status: 'Completed' } : t
      ));
      // Refresh prediction
      try {
        const predRes = await axios.get(`${API_URL}/api/prediction/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrediction(predRes.data.prediction || null);
      } catch { /* ok */ }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark task complete');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const hasTasks      = tasks.length > 0;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const totalCount     = tasks.length;
  const progressPct    = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: C.bg, minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 760, mx: 'auto', px: 3 }}>

        {/* ── Top nav ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton onClick={() => navigate(`/user/projects/${id}`)} size="small"
            sx={{ border: `1px solid ${C.border}`, bgcolor: C.surface }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography fontSize={13} color={C.muted}>
              {project?.title || 'Project'} · My Workspace
            </Typography>
          </Box>
        </Box>

        {/* ── Page title ── */}
        <Box sx={{ mb: 3 }}>
          <Typography fontWeight={800} fontSize={22} color={C.text} sx={{ letterSpacing: '-0.3px' }}>
            My Workspace
          </Typography>
          <Typography fontSize={13} color={C.muted} mt={0.3}>
            Set up your component, generate tasks, and track your progress
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* ── Prediction card (top if exists) ── */}
        {prediction && <PredictionCard prediction={prediction} />}

        {/* ── Section 1: My Setup ── */}
        <Section icon={<AssignmentIcon />} title="My Setup" subtitle="Describe your component and set your available study time">

          {setupSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{setupSuccess}</Alert>
          )}
          {setupError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSetupError('')}>
              {setupError}
            </Alert>
          )}

          {/* Individual part */}
          <TextField
            fullWidth multiline rows={3}
            label="My Individual Component *"
            placeholder="Describe exactly what YOU are responsible for in this project. e.g. I am building the user authentication module including login, signup, JWT tokens, and password reset functionality."
            value={individualPart}
            onChange={(e) => { setIndividualPart(e.target.value); setSetupSaved(false); }}
            helperText="Be specific — this is used to generate tasks tailored to your part"
            sx={{ mb: 3 }}
          />

          {/* Available time */}
          <Typography fontWeight={600} fontSize={14} color={C.text} mb={0.5}>
            My Available Time for This Project
          </Typography>
          <Typography fontSize={12} color={C.muted} mb={2}>
            How many hours per day can you work on this project?
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 2, p: 2 }}>
                <Typography fontSize={13} fontWeight={600} color={C.text} mb={1.5}>
                  🌤 Weekdays
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Stepper value={weekdays} onChange={setWeekdays} color={C.primary} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 2, p: 2 }}>
                <Typography fontSize={13} fontWeight={600} color={C.text} mb={1.5}>
                  🌙 Weekends
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Stepper value={weekends} onChange={setWeekends} color="#F4A261" />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Button variant="contained" onClick={handleSaveSetup} disabled={setupLoading}
            startIcon={setupLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            sx={{
              fontWeight: 700, borderRadius: 2,
              bgcolor: C.primary, '&:hover': { bgcolor: '#3451d1' },
            }}>
            {setupLoading ? 'Saving...' : 'Save Setup'}
          </Button>
        </Section>

        {/* ── Section 2: Workload Check ── */}
        {workload && (
          <Paper elevation={0} sx={{
            border: `1px solid ${workload.isWarning ? C.warning : C.success}`,
            borderRadius: 3, p: 2.5, mb: 3,
            bgcolor: workload.isWarning ? C.warningSoft : C.successSoft,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              {workload.isWarning
                ? <WarningAmberIcon sx={{ color: C.warning, mt: 0.2 }} />
                : <CheckCircleIcon sx={{ color: C.success, mt: 0.2 }} />
              }
              <Box>
                <Typography fontWeight={700} fontSize={14}
                  color={workload.isWarning ? C.warning : C.success}>
                  {workload.isWarning ? 'Workload Warning' : 'Workload Looks Good'}
                </Typography>
                <Typography fontSize={13} color={C.text} mt={0.3}>
                  {workload.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                  <Box>
                    <Typography fontSize={11} color={C.muted}>Free hours</Typography>
                    <Typography fontWeight={700} fontSize={16} color={C.text}>
                      {workload.freeHours?.toFixed(0)} hrs
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={11} color={C.muted}>Committed elsewhere</Typography>
                    <Typography fontWeight={700} fontSize={16} color={C.text}>
                      {workload.committedHours?.toFixed(0)} hrs
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* ── Section 3: Generate Tasks ── */}
        <Section
          icon={<AutoAwesomeIcon />}
          title={hasTasks ? 'My Tasks' : 'Generate Tasks'}
          subtitle={hasTasks
            ? `${completedCount} of ${totalCount} tasks completed`
            : 'AI will generate personalised tasks based on your component and the assignment PDF'
          }
        >
          {/* Progress bar */}
          {hasTasks && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography fontSize={12} color={C.muted}>Overall Progress</Typography>
                <Typography fontSize={12} fontWeight={700} color={C.primary}>
                  {progressPct.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressPct}
                sx={{ height: 8, borderRadius: 4, bgcolor: C.border,
                  '& .MuiLinearProgress-bar': { bgcolor: C.primary, borderRadius: 4 } }} />
            </Box>
          )}

          {genError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setGenError('')}>
              {genError}
            </Alert>
          )}

          {/* Generate button */}
          {!hasTasks ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography fontSize={13} color={C.muted} mb={2.5}>
                {!setupSaved
                  ? 'Save your setup first to enable task generation'
                  : 'Ready to generate your personalised tasks'
                }
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={generateLoading
                  ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                  : <AutoAwesomeIcon />
                }
                onClick={handleGenerate}
                disabled={!setupSaved || generateLoading}
                sx={{
                  px: 4, py: 1.5, fontWeight: 700, borderRadius: 3,
                  bgcolor: C.primary, boxShadow: `0 4px 14px ${C.primary}40`,
                  '&:hover': { bgcolor: '#3451d1' },
                  '&:disabled': { bgcolor: C.border },
                }}
              >
                {generateLoading ? 'Generating Tasks...' : '✨ Generate My Tasks'}
              </Button>
              {generateLoading && (
                <Typography fontSize={12} color={C.muted} mt={1.5}>
                  AI is generating your personalised tasks — this takes about 15 seconds...
                </Typography>
              )}
            </Box>
          ) : (
            <>
              {/* Task list */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {tasks.map(task => (
                  <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
                ))}
              </Box>

              {/* Regenerate option */}
              <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={generateLoading
                    ? <CircularProgress size={14} />
                    : <AutoAwesomeIcon />
                  }
                  onClick={handleGenerate}
                  disabled={generateLoading}
                  sx={{ fontSize: 12, borderRadius: 2, color: C.muted, borderColor: C.border,
                    '&:hover': { borderColor: C.primary, color: C.primary } }}
                >
                  {generateLoading ? 'Regenerating...' : 'Regenerate Tasks'}
                </Button>
                <Typography fontSize={11} color={C.muted} mt={0.5}>
                  This will replace all current tasks
                </Typography>
              </Box>
            </>
          )}
        </Section>

      </Box>
    </Box>
  );
};

export default TaskDialog;
//export default TaskDialog;
