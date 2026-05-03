import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Box, Typography, Paper, Button, CircularProgress,
  Alert, TextField, Chip, Collapse, IconButton, Divider,
} from '@mui/material';
import ArrowBackIcon       from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon     from '@mui/icons-material/AutoAwesome';
import PictureAsPdfIcon    from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon     from '@mui/icons-material/Description';
import PersonIcon          from '@mui/icons-material/Person';
import TuneIcon            from '@mui/icons-material/Tune';
import ExpandMoreIcon      from '@mui/icons-material/ExpandMore';
import ExpandLessIcon      from '@mui/icons-material/ExpandLess';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import WarningAmberIcon    from '@mui/icons-material/WarningAmber';

// ── Colours ───────────────────────────────────────────────────────────────────
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
};

// ── Info row — shows what will be sent to AI ──────────────────────────────────
const InfoChip = ({ icon, label, value, color = C.primary }) => (
  <Box sx={{
    display: 'flex', alignItems: 'flex-start', gap: 1.5,
    p: 2, borderRadius: 2,
    border: `1px solid ${color}20`,
    bgcolor: `${color}08`,
  }}>
    <Box sx={{ color, mt: 0.1, flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography fontSize={11} fontWeight={700} color={color}
        textTransform="uppercase" letterSpacing={0.6} mb={0.3}>
        {label}
      </Typography>
      <Typography fontSize={13} color={C.text} lineHeight={1.5}
        sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// ── Generating animation ──────────────────────────────────────────────────────
const GeneratingScreen = () => {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  const steps = [
    'Reading assignment PDF...',
    'Analysing your individual component...',
    'Planning tasks based on deadline...',
    'Generating personalised task list...',
  ];

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: '50%',
        bgcolor: C.primarySoft,
        border: `2px solid ${C.primary}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mx: 'auto', mb: 3,
        animation: 'pulse 1.5s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)',    opacity: 1   },
          '50%':      { transform: 'scale(1.08)', opacity: 0.8 },
        },
      }}>
        <AutoAwesomeIcon sx={{ fontSize: 32, color: C.primary }} />
      </Box>

      <Typography fontWeight={800} fontSize={18} color={C.text} mb={1}>
        Generating Your Tasks{'.'.repeat(dot + 1)}
      </Typography>
      <Typography fontSize={13} color={C.muted} mb={4}>
        This usually takes 15–30 seconds
      </Typography>

      {steps.map((step, i) => (
        <Box key={i} sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          maxWidth: 340, mx: 'auto', mb: 1.5,
          opacity: dot >= i ? 1 : 0.3,
          transition: 'opacity 0.5s ease',
        }}>
          <CheckCircleIcon sx={{ fontSize: 16, color: dot > i ? C.success : C.muted }} />
          <Typography fontSize={13} color={dot > i ? C.success : C.muted} fontWeight={dot === i ? 700 : 400}>
            {step}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const BgenerateTask = () => {
  const { id }          = useParams();   // projectId
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  // Project data
  const [project,        setProject]        = useState(null);
  const [myMember,       setMyMember]       = useState(null);
  const [alreadyHasTasks, setAlreadyHasTasks] = useState(false);

  // Form
  const [individualPart, setIndividualPart] = useState('');
  const [showOptional,   setShowOptional]   = useState(false);
  const [additionalRules, setAdditionalRules] = useState('');

  // UI
  const [pageLoading,  setPageLoading]  = useState(true);
  const [generating,   setGenerating]   = useState(false);
  const [error,        setError]        = useState('');
  const [fieldError,   setFieldError]   = useState('');

  // ── Load project + my member record ───────────────────────────────────────
  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setPageLoading(true);
    try {
      const headers       = { Authorization: `Bearer ${token}` };
      const currentUserId = user._id || user.id;

      const projRes = await axios.get(`${API_URL}/api/projects/${id}`, { headers });
      const { project: p, members } = projRes.data;
      setProject(p);

      // Find my member record — pre-fill if already set
      const me = (members || []).find(m =>
        String(m.userId?._id || m.userId) === String(currentUserId)
      );
      if (me) {
        setMyMember(me);
        if (me.individualPart) setIndividualPart(me.individualPart);
      }

      // Check if tasks already generated
      const taskRes = await axios.get(`${API_URL}/api/tasks`, {
        headers, params: { projectId: id },
      });
      const myTasks = (taskRes.data.tasks || []).filter(t =>
        String(t.assigneeId?._id || t.assigneeId) === String(currentUserId)
      );
      setAlreadyHasTasks(myTasks.length > 0);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setPageLoading(false);
    }
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!individualPart.trim()) {
      setFieldError('Please describe your individual component before generating');
      return;
    }
    if (individualPart.trim().length < 20) {
      setFieldError('Please be more specific — at least 20 characters');
      return;
    }

    setFieldError('');
    setError('');
    setGenerating(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Save individual part first
      await axios.put(
        `${API_URL}/api/members/${id}/part`,
        { individualPart: individualPart.trim() },
        { headers }
      );

      // 2. Generate tasks
      await axios.post(
        `${API_URL}/api/tasks/generate`,
        {
          projectId:       id,
          individualPart:  individualPart.trim(),
          additionalRules: additionalRules.trim() || null,
        },
        { headers }
      );

      // 3. Go to task board
      navigate(`/user/taskboard/${id}`);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate tasks. Please try again.');
      setGenerating(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  // ── Generating screen ──────────────────────────────────────────────────────
  if (generating) return (
    <Box sx={{ bgcolor: C.bg, minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 560, mx: 'auto', px: 3 }}>
        <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3 }}>
          <GeneratingScreen />
        </Paper>
      </Box>
    </Box>
  );

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: C.bg, minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 620, mx: 'auto', px: 3 }}>

        {/* Nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton size="small" onClick={() => navigate(`/user/projects/${id}`)}
            sx={{ border: `1px solid ${C.border}`, bgcolor: C.surface }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography fontSize={13} color={C.muted}>
            {project?.title || 'Project'} · Generate Tasks
          </Typography>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ color: C.primary, fontSize: 22 }} />
            </Box>
            <Typography fontWeight={800} fontSize={22} color={C.text} sx={{ letterSpacing: '-0.3px' }}>
              Generate Your Tasks
            </Typography>
          </Box>
          <Typography fontSize={13} color={C.muted} mt={0.5}>
            AI will create personalised tasks based on your component and the assignment details
          </Typography>
        </Box>

        {/* Already has tasks warning */}
        {alreadyHasTasks && (
          <Box sx={{
            display: 'flex', gap: 1.5, p: 2, mb: 3, borderRadius: 2,
            bgcolor: C.warningSoft, border: `1px solid ${C.warning}30`,
          }}>
            <WarningAmberIcon sx={{ color: C.warning, fontSize: 20, flexShrink: 0 }} />
            <Box>
              <Typography fontSize={13} fontWeight={700} color={C.warning}>
                You already have generated tasks
              </Typography>
              <Typography fontSize={12} color={C.muted} mt={0.3}>
                Generating again will replace all your existing tasks. This cannot be undone.
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* What AI will use */}
        <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Box sx={{ px: 3, py: 2, bgcolor: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <Typography fontWeight={700} fontSize={14} color={C.text}>
              What AI will use to generate your tasks
            </Typography>
          </Box>
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

            {/* PDF */}
            <InfoChip
              icon={<PictureAsPdfIcon />}
              label="Assignment PDF"
              value={project?.pdfName
                ? `✓ ${project.pdfName}`
                : 'No PDF uploaded — tasks will be based on description only'
              }
              color={project?.pdfName ? C.success : C.warning}
            />

            {/* Project description / approach */}
            <InfoChip
              icon={<DescriptionIcon />}
              label="Assignment Approach"
              value={project?.approach || project?.description || project?.generatedDesc || 'No description available'}
              color={C.primary}
            />

            {/* Due date */}
            <InfoChip
              icon={<AutoAwesomeIcon />}
              label="Deadline"
              value={project?.dueDate
                ? new Date(project.dueDate).toLocaleDateString('en-US',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })
                : 'No deadline set'
              }
              color={C.muted}
            />
          </Box>
        </Paper>

        {/* Individual part input */}
        <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
          <Box sx={{ px: 3, py: 2, bgcolor: C.bg, borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonIcon sx={{ color: C.primary, fontSize: 20 }} />
            <Box>
              <Typography fontWeight={700} fontSize={14} color={C.text}>
                My Individual Component
                <Box component="span" sx={{ color: C.error, ml: 0.5 }}>*</Box>
              </Typography>
              <Typography fontSize={12} color={C.muted}>
                Describe exactly what YOU are responsible for in this project
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={`Examples:\n• I am building the user authentication module — login, signup, JWT tokens and password reset\n• I am responsible for the database design and all MongoDB schemas\n• I will implement the REST API endpoints for the product catalogue`}
              value={individualPart}
              onChange={(e) => {
                setIndividualPart(e.target.value);
                if (fieldError) setFieldError('');
              }}
              error={!!fieldError}
              helperText={fieldError || `${individualPart.length} characters — be as specific as possible`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 14,
                  '&.Mui-focused fieldset': { borderColor: C.primary },
                },
              }}
            />
          </Box>
        </Paper>

        {/* Optional rules */}
        <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Box
            onClick={() => setShowOptional(p => !p)}
            sx={{
              px: 3, py: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: showOptional ? C.primarySoft : C.bg,
              borderBottom: showOptional ? `1px solid ${C.border}` : 'none',
              transition: 'background 0.2s',
              '&:hover': { bgcolor: C.primarySoft },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TuneIcon sx={{ color: showOptional ? C.primary : C.muted, fontSize: 20 }} />
              <Box>
                <Typography fontWeight={700} fontSize={14} color={showOptional ? C.primary : C.text}>
                  Additional Rules or Preferences
                  <Chip label="Optional" size="small"
                    sx={{ ml: 1, height: 18, fontSize: 10, bgcolor: '#F3F4F6', color: C.muted }} />
                </Typography>
                <Typography fontSize={12} color={C.muted}>
                  Specific instructions for the AI to follow when generating your tasks
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShowOptional(p => !p); }}>
              {showOptional ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Collapse in={showOptional}>
            <Box sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Rules"
                placeholder={`Examples:\n• Focus more on testing tasks\n• I prefer smaller tasks spread across more days\n• Include documentation tasks for every feature`}
                value={additionalRules}
                onChange={(e) => setAdditionalRules(e.target.value)}
                helperText="These instructions will be added to the AI prompt"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: C.primary },
                }}
              />
            </Box>
          </Collapse>
        </Paper>

        {/* Generate button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleGenerate}
          disabled={generating}
          startIcon={<AutoAwesomeIcon />}
          sx={{
            py: 2, fontWeight: 700, fontSize: 16, borderRadius: 3,
            bgcolor:    C.primary,
            boxShadow: `0 4px 20px ${C.primary}40`,
            '&:hover': { bgcolor: '#3451d1', boxShadow: `0 6px 24px ${C.primary}60` },
            '&:disabled': { bgcolor: C.border },
          }}
        >
          Generate My Tasks
        </Button>

        <Typography fontSize={12} color={C.muted} textAlign="center" mt={1.5}>
          AI will generate 6–10 personalised tasks based on your component and the assignment deadline
        </Typography>

      </Box>
    </Box>
  );
};

export default BgenerateTask;