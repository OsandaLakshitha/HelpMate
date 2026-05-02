import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, Chip, Button,
  CircularProgress, Alert, Divider, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import ArrowBackIcon        from '@mui/icons-material/ArrowBack';
import EditIcon             from '@mui/icons-material/Edit';
import DeleteIcon           from '@mui/icons-material/Delete';
import LockIcon             from '@mui/icons-material/Lock';
import GroupsIcon           from '@mui/icons-material/Groups';
import CalendarTodayIcon    from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon     from '@mui/icons-material/PictureAsPdf';
import DownloadIcon         from '@mui/icons-material/Download';
import WorkspacesIcon       from '@mui/icons-material/Workspaces';
import StarIcon             from '@mui/icons-material/Star';
import AutoAwesomeIcon      from '@mui/icons-material/AutoAwesome';
import BarChartIcon         from '@mui/icons-material/BarChart';
import { DatePicker }          from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns }       from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import BProjectStats from '../../../components/Bcomponents/ProjectStats';

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
  // New colors for RAP specifics
  info:        '#0EA5E9',
  infoSoft:    '#F0F9FF',
  urgent:      '#EA580C',
  urgentSoft:  '#FFF7ED',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const avatarColor = (str = '') => {
  const colors = ['#4361EE', '#F4A261', '#2DC76D', '#E63946', '#9B5DE5', '#00B4D8'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const formatDate = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const daysLeft = (dueDate) => {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

// ── Prediction badge (UPDATED FOR RAP STATUS) ────────────────────────────────
const PredictionBadge = ({ 
  status, 
  rapStatus, 
  tasksCompleted = 0, 
  totalTasks = 0 
}) => {
  
  // ── NEW LOGIC: Prioritize task completion state for simple progress indication ──
  let finalStatus;
  
  if (totalTasks > 0 && tasksCompleted >= totalTasks) {
    // ✅ All tasks completed
    finalStatus = 'complete';
  } else if (tasksCompleted > 0) {
    // ✅ At least 1 task done, but not all → "Started"
    finalStatus = 'started';
  } else if (tasksCompleted === 0 && totalTasks > 0) {
    // ✅ No tasks done yet, but tasks exist → "Not Started"
    finalStatus = 'not-started';
  } else {
    // 🔄 Fallback to original RAP/status logic if no task data
    finalStatus = rapStatus || status || 'not-started';
  }

  // ── Status Mapping ──────────────────────────────────────────────────────────
  const map = {
    // ── Progress States (NEW - Priority) ─────────────────────────────────────
    'not-started': { 
      label: 'Not Started', 
      bg: '#F3F4F6', 
      color: C.muted, 
      border: C.border, 
      icon: '📋' 
    },
    'started': { 
      label: 'Started', 
      bg: C.infoSoft, 
      color: C.info, 
      border: C.info, 
      icon: '▶️' 
    },
    'complete': { 
      label: 'Complete', 
      bg: C.purpleSoft, 
      color: C.purple, 
      border: C.purple, 
      icon: '🎉' 
    },
    
    // ── Risk States (Fallback) ───────────────────────────────────────────────
    'on-track': { 
      label: 'On Track', 
      bg: C.successSoft, 
      color: C.success, 
      border: C.success, 
      icon: '✨' 
    },
    'at-risk': { 
      label: 'At Risk', 
      bg: C.warningSoft, 
      color: C.warning, 
      border: C.warning, 
      icon: '⚠️' 
    },
    'in-danger': { 
      label: 'In Danger', 
      bg: C.errorSoft, 
      color: C.error, 
      border: C.error, 
      icon: '🚨' 
    },
    
    // ── RAP Specific States (Fallback) ───────────────────────────────────────
    'on-track-fragile': { 
      label: 'On Track', 
      bg: C.infoSoft, 
      color: C.info, 
      border: C.info, 
      icon: '⚡' 
    },
    'at-risk-recoverable': { 
      label: 'Can Catch Up', 
      bg: C.warningSoft, 
      color: '#D97706', 
      border: '#D97706', 
      icon: '🔄' 
    },
    'danger-recoverable': { 
      label: 'Urgent · Recover', 
      bg: C.urgentSoft, 
      color: C.urgent, 
      border: C.urgent, 
      icon: '⚡' 
    },
  };

  const s = map[finalStatus] || map['not-started'];

  return (
    <Box sx={{
      px: 1.5, 
      py: 0.5, 
      borderRadius: 5,
      bgcolor: s.bg, 
      border: `1px solid ${s.border}`,
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 0.6,
      whiteSpace: 'nowrap',
    }}>
      {s.icon && <Typography fontSize={12}>{s.icon}</Typography>}
      <Typography fontSize={11} fontWeight={700} color={s.color}>
        {s.label}
      </Typography>
    </Box>
  );
};

// ── Complexity colour ─────────────────────────────────────────────────────────
const complexityColor = (v) => ({
  Low: 'success', Medium: 'warning', High: 'error',
}[v] || 'default');

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ icon, title, children, action }) => (
  <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
    <Box sx={{
      px: 3, py: 2, bgcolor: C.bg, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color: C.primary }}>{icon}</Box>
        <Typography fontWeight={700} fontSize={15} color={C.text}>{title}</Typography>
      </Box>
      {action}
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

// ── Info tile ─────────────────────────────────────────────────────────────────
const Tile = ({ label, children }) => (
  <Box>
    <Typography fontSize={11} fontWeight={600} color={C.muted} textTransform="uppercase" letterSpacing={0.5} mb={0.5}>
      {label}
    </Typography>
    {children}
  </Box>
);

// ═════════════════════════════════════════════════════════════════════════════
const ProjectView = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user, token } = useAuth();

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [project,  setProject]  = useState(null);
  const [members,  setMembers]  = useState([]);
  const [predictions, setPredictions] = useState([]);

  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeOpen,  setCloseOpen]  = useState(false);
  const [statsOpen,  setStatsOpen]  = useState(false);

  const [editForm, setEditForm] = useState({
    title: '', description: '', projectType: '', complexity: '', dueDate: null,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, predRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/projects/${id}`,          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/prediction/${id}`,        { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (projRes.status === 'fulfilled') {
        const { project: p, members: m } = projRes.value.data;
        const currentUserId = user._id || user.id;
        const isCreator = String(p.creatorId) === String(currentUserId);
        const isMember  = m?.some(mb => String(mb.userId?._id || mb.userId) === String(currentUserId));

        if (!isCreator && !isMember) {
          setError('You do not have permission to view this project');
          setTimeout(() => navigate('/user/projects'), 2000);
          return;
        }

        setProject(p);
        setMembers(m || []);
        setEditForm({
          title:       p.title        || '',
          description: p.description  || '',
          projectType: p.projectType  || '',
          complexity:  p.complexity   || '',
          dueDate:     p.dueDate      || null,
        });
      } else {
        setError('Failed to load project');
      }

      if (predRes.status === 'fulfilled') {
        // Endpoint returns { prediction: {...} }, wrap in array for consistency
        const prediction = predRes.value.data.prediction;
        setPredictions(prediction ? [prediction] : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    try {
      const res = await axios.patch(`${API_URL}/api/projects/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setProject(res.data.project);
      setEditOpen(false);
      setSuccess('Project updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    }
  };

  // ── Close ──────────────────────────────────────────────────────────────────
  const handleClose = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/projects/${id}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data.project);
      setCloseOpen(false);
      setSuccess('Project closed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close project');
      setCloseOpen(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Project deleted');
      setTimeout(() => navigate('/user/projects'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
      setDeleteOpen(false);
    }
  };

  const currentUserId  = user?._id || user?.id;
  const isCreator      = String(project?.creatorId) === String(currentUserId);
  const isClosed       = project?.status?.toLowerCase() === 'closed';
  const remaining      = daysLeft(project?.dueDate);

  // Since predictions is now an array with just the current user's prediction
  const currentPrediction = predictions?.[0] || null;
  
  const projectStatsProject = project && currentPrediction ? {
    ...project,
    projectId: project._id || project.projectId,
    studentId: currentPrediction.studentId,
    // ── Status fields ──────────────────────────────────────────────
    rapStatus: currentPrediction.rapStatus || project.status?.toLowerCase() || 'not-started',
    rapMessage: currentPrediction.rapMessage,
    status: currentPrediction.status,
    coldStart: currentPrediction.coldStart ?? false,
    
    // ── Task counts ────────────────────────────────────────────────
    pendingTaskCount: currentPrediction.pendingTaskCount ?? 0,
    totalTaskCount: currentPrediction.totalTaskCount ?? 0,
    completedToday: currentPrediction.todayCompletedCount ?? 0,
    dailyTarget: currentPrediction.dailyTarget ?? 0,
    
    // ── Formula fields (RAP Engine) ────────────────────────────────
    deadlinePressure: currentPrediction.deadlinePressure ?? null,       // RCR [R1]
    complexityCapacity: currentPrediction.complexityCapacity ?? null,   // [R4]
    loadFactor: currentPrediction.loadFactor ?? 1.0,                    // [R5]
    studentRatio: currentPrediction.studentRatio ?? null,               // SPI(t) [R2+R3]
    projectedDaysNeeded: currentPrediction.projectedDaysNeeded ?? null, // TEAC [R2]
    paceDelta: currentPrediction.paceDelta ?? null,                     // SV% [R1]
    resilienceScore: currentPrediction.resilienceScore ?? null,         // [R7]
    confidence: currentPrediction.confidence ?? 0.30,                   // [R6]
    daysLeft: currentPrediction.daysLeft ?? null,
    
    // ── Progress fields ────────────────────────────────────────────
    workCompletionPct: currentPrediction.workCompletionPct ?? 0,
    timeElapsedPct: currentPrediction.timeElapsedPct ?? 0,
    
    // ── Data quality ───────────────────────────────────────────────
    dataPointsUsed: currentPrediction.dataPointsUsed ?? 0,
    isEstimated: currentPrediction.isEstimated ?? true,
    capacityWarning: currentPrediction.capacityWarning,
    activeProjects: currentPrediction.activeProjects ?? 1,
    
    // ── Flags ──────────────────────────────────────────────────────
    isOverdue: project.dueDate ? new Date(project.dueDate) < new Date() : false,
  } : project ? {
    ...project,
    projectId: project._id || project.projectId,
    rapStatus: project.status?.toLowerCase() || 'not-started',
    isOverdue: project.dueDate ? new Date(project.dueDate) < new Date() : false,
    coldStart: false,
  } : null;

  const statsTargetSummary = {
    met: projectStatsProject?.dailyTarget > 0 && projectStatsProject?.completedToday >= projectStatsProject?.dailyTarget ? 1 : 0,
    missed: projectStatsProject?.dailyTarget > 0 && projectStatsProject?.completedToday > 0 && projectStatsProject?.completedToday < projectStatsProject?.dailyTarget ? 1 : 0,
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!project) return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Alert severity="error">Project not found</Alert>
    </Container>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: C.bg, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">

        {/* ── Top nav ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate('/user/projects')} size="small"
              sx={{ border: `1px solid ${C.border}`, bgcolor: C.surface }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography fontSize={13} color={C.muted}>Back to Projects</Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => navigate(`/user/generate-tasks/${id}`)}
            sx={{
              bgcolor: '#13a2a2',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              marginLeft:45,
              textTransform: 'none',
              boxShadow: '0 2px 10px rgba(19,162,162,0.25)',
              '&:hover': { bgcolor: '#035757', boxShadow: '0 4px 16px rgba(19,162,162,0.35)' },
            }}
          >
            Generate Your Tasks
          </Button>
          <Button
            onClick={() => setStatsOpen(true)}
            startIcon={<BarChartIcon />}
            size="small"
            variant="contained"
            sx={{
              bgcolor: '#13a2a2',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              textTransform: 'none',
              boxShadow: '0 2px 10px rgba(19,162,162,0.25)',
              '&:hover': { bgcolor: '#035757', boxShadow: '0 4px 16px rgba(19,162,162,0.35)' },
            }}
          >
            View Statistics
          </Button>
        </Box>

        {/* ── Alerts ── */}
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* ── Header card ── */}
        <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <Typography fontWeight={800} fontSize={22} color={C.text} sx={{ letterSpacing: '-0.3px' }}>
                  {project.title}
                </Typography>
                <Chip
                  label={isClosed ? 'Closed' : 'Open'}
                  size="small"
                  sx={{
                    bgcolor: isClosed ? '#F3F4F6' : C.primarySoft,
                    color:   isClosed ? C.muted   : C.primary,
                    fontWeight: 700, fontSize: 11,
                  }}
                />
              </Box>

              {/* Due date countdown */}
              {project.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 14, color: remaining !== null && remaining < 7 ? C.error : C.muted }} />
                  <Typography fontSize={13} color={remaining !== null && remaining < 7 ? C.error : C.muted}>
                    Due {formatDate(project.dueDate)}
                    {remaining !== null && (
                      <Box component="span" fontWeight={700} ml={0.5}>
                        {remaining > 0 ? `· ${remaining} days left` : remaining === 0 ? '· Due today' : `· ${Math.abs(remaining)} days overdue`}
                      </Box>
                    )}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Creator actions */}
            {isCreator && !isClosed && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => setEditOpen(true)}
                  sx={{ border: `1px solid ${C.border}`, bgcolor: C.surface }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <Button size="small" variant="outlined" color="warning"
                  startIcon={<LockIcon />} onClick={() => setCloseOpen(true)}
                  sx={{ fontSize: 12, borderRadius: 2 }}>
                  Close
                </Button>
                <Button size="small" variant="outlined" color="error"
                  startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}
                  sx={{ fontSize: 12, borderRadius: 2 }}>
                  Delete
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Info tiles */}
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Tile label="Type">
                <Typography fontSize={14} fontWeight={600} color={C.text}>{project.projectType || '—'}</Typography>
              </Tile>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Tile label="Complexity">
                <Chip label={project.complexity || '—'} color={complexityColor(project.complexity)} size="small" sx={{ fontWeight: 700 }} />
              </Tile>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Tile label="Members">
                <Typography fontSize={14} fontWeight={600} color={C.text}>{members.length}</Typography>
              </Tile>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Tile label="Created">
                <Typography fontSize={14} fontWeight={600} color={C.text}>{formatDate(project.createdAt)}</Typography>
              </Tile>
            </Grid>
          </Grid>
        </Paper>

        {/* ── Assignment Brief ── */}
        {(project.generatedDesc || project.approach || project.pdfPath) && (
          <Section icon={<AutoAwesomeIcon />} title="Assignment Brief">

            {/* AI generated description */}
            {project.generatedDesc && (
              <Box sx={{ mb: project.approach ? 2.5 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 14, color: C.primary }} />
                  <Typography fontSize={12} fontWeight={600} color={C.primary}>AI Summary</Typography>
                </Box>
                <Typography fontSize={14} color={C.text} lineHeight={1.7}>
                  {project.generatedDesc}
                </Typography>
              </Box>
            )}

            {project.generatedDesc && project.approach && <Divider sx={{ my: 2 }} />}

            {/* Group approach */}
            {project.approach && (
              <Box sx={{ mb: project.pdfPath ? 2.5 : 0 }}>
                <Typography fontSize={12} fontWeight={600} color={C.muted} mb={0.8}>
                  GROUP APPROACH
                </Typography>
                <Typography fontSize={14} color={C.text} lineHeight={1.7}>
                  {project.approach}
                </Typography>
              </Box>
            )}

            {/* PDF download */}
            {project.pdfPath && (
              <>
                {(project.generatedDesc || project.approach) && <Divider sx={{ my: 2 }} />}
                <Box
                  component="a"
                  href={`${API_URL}/${project.pdfPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display:     'inline-flex',
                    alignItems:  'center',
                    gap:         1,
                    px:          2,
                    py:          1,
                    border:      `1px solid ${C.border}`,
                    borderRadius: 2,
                    bgcolor:     C.bg,
                    textDecoration: 'none',
                    '&:hover':   { borderColor: C.primary, bgcolor: C.primarySoft },
                    transition:  'all 0.2s',
                  }}
                >
                  <PictureAsPdfIcon sx={{ color: C.error, fontSize: 20 }} />
                  <Typography fontSize={13} fontWeight={600} color={C.text}>
                    {project.pdfName || 'Assignment PDF'}
                  </Typography>
                  <DownloadIcon sx={{ fontSize: 16, color: C.muted }} />
                </Box>
              </>
            )}
          </Section>
        )}

        {/* ── Team Members ── */}
        <Section
          icon={<GroupsIcon />}
          title={`Team Members (${members.length})`}
        >
          {members.length === 0 ? (
            <Typography color={C.muted} fontSize={14}>No members found</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {members.map((member, i) => {
                const uid         = member.userId?._id || member.userId;
                const firstName   = member.userId?.firstName || '';
                const lastName    = member.userId?.lastName  || '';
                const fullName    = `${firstName} ${lastName}`.trim() || member.email || 'Unknown';
                const email       = member.userId?.email || member.email || '';
                const isMemberCreator = String(uid) === String(project.creatorId);
                const isCurrentUser = String(uid) === String(currentUserId);
                
                // Only show prediction for current user
                const prediction = isCurrentUser ? currentPrediction : null;

                return (
                  <Box
                    key={i}
                    sx={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          2,
                      p:            2,
                      border:       `1px solid ${isMemberCreator ? C.primary : C.border}`,
                      borderRadius: 2,
                      bgcolor:      isMemberCreator ? C.primarySoft : C.surface,
                    }}
                  >
                    <Avatar sx={{ bgcolor: avatarColor(email), width: 40, height: 40, fontSize: 14 }}>
                      {getInitials(fullName)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography fontWeight={700} fontSize={14} color={C.text}>
                          {fullName}
                        </Typography>
                        {isMemberCreator && (
                          <Chip
                            icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                            label="Creator"
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: 11 }}
                          />
                        )}
                      </Box>
                      <Typography fontSize={12} color={C.muted}>{email}</Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography fontSize={11} color={C.muted} mb={0.5}>
                        {member.componentName || 'No role set'}
                      </Typography>
                      
                      {/* ✅ FIXED: Pass both status and rapStatus */}
                      <PredictionBadge 
                        status={prediction?.status || 'not-started'} 
                        rapStatus={prediction?.rapStatus} 
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Section>

        

      </Container>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Project</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField fullWidth label="Title" value={editForm.title}
            onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Description" value={editForm.description}
            onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
            multiline rows={3} margin="normal" />
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Project Type</InputLabel>
                <Select value={editForm.projectType}
                  onChange={(e) => setEditForm(p => ({ ...p, projectType: e.target.value }))} label="Project Type">
                  <MenuItem value="Coding">Coding</MenuItem>
                  <MenuItem value="Documentation">Documentation</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Complexity</InputLabel>
                <Select value={editForm.complexity}
                  onChange={(e) => setEditForm(p => ({ ...p, complexity: e.target.value }))} label="Complexity">
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker label="Due Date" value={editForm.dueDate}
              onChange={(d) => setEditForm(p => ({ ...p, dueDate: d }))}
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }} />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ── Close Dialog ── */}
      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Close Project</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>This will mark the project as completed.</Alert>
          <Typography>Are you sure you want to close this project?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCloseOpen(false)}>Cancel</Button>
          <Button onClick={handleClose} variant="contained" color="warning">Close Project</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Project</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>This action cannot be undone!</Alert>
          <Typography>All tasks and member data will be permanently deleted.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete Permanently</Button>
        </DialogActions>
      </Dialog>

      {/* ── Project Stats Modal ── */}
      <Dialog open={statsOpen} onClose={() => setStatsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>Project Statistics</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <BProjectStats projects={projectStatsProject ? [projectStatsProject] : []} targetSummary={statsTargetSummary} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatsOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ProjectView;