import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Typography, Button, CircularProgress,
  Alert, Paper, Grid, TextField, IconButton, Switch,
  Collapse, Divider
} from '@mui/material';
import WbSunnyIcon     from '@mui/icons-material/WbSunny';
import NightsStayIcon  from '@mui/icons-material/NightsStay';
import SchoolIcon      from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon  from '@mui/icons-material/AccessTime';
import AddIcon         from '@mui/icons-material/Add';
import RemoveIcon      from '@mui/icons-material/Remove';
import TuneIcon        from '@mui/icons-material/Tune';

const C = {
  bg:         '#F7F8FC',
  surface:    '#FFFFFF',
  border:     '#E4E7EF',
  primary:    '#4361EE',
  primarySoft:'#EEF1FD',
  text:       '#1A1D2E',
  muted:      '#6B7280',
  success:    '#2DC76D',
};

const MIN = 2;
const MAX = 18;
const STEP = 0.5;

// ── +/- Stepper ───────────────────────────────────────────────────────────────
const Stepper = ({ value, onChange, color, size = 'lg' }) => {
  const dec = () => onChange(Math.max(MIN,  Math.round((value - STEP) * 10) / 10));
  const inc = () => onChange(Math.min(MAX, Math.round((value + STEP) * 10) / 10));
  const isLg = size === 'lg';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: isLg ? 2 : 1 }}>
      <IconButton onClick={dec} disabled={value <= MIN} size="small" sx={{
        width: isLg ? 36 : 28, height: isLg ? 36 : 28,
        bgcolor: C.surface, border: `1px solid ${C.border}`,
        '&:hover':    { bgcolor: `${color}10`, borderColor: color },
        '&:disabled': { opacity: 0.3 },
      }}>
        <RemoveIcon sx={{ fontSize: isLg ? 18 : 14 }} />
      </IconButton>

      <Box sx={{ textAlign: 'center', minWidth: isLg ? 64 : 44 }}>
        <Typography fontWeight={800} fontSize={isLg ? 32 : 18} color={color} sx={{ lineHeight: 1 }}>
          {value}
        </Typography>
        {isLg && <Typography fontSize={10} color={C.muted} mt={0.2}>hrs/day</Typography>}
      </Box>

      <IconButton onClick={inc} disabled={value >= MAX} size="small" sx={{
        width: isLg ? 36 : 28, height: isLg ? 36 : 28,
        bgcolor: C.surface, border: `1px solid ${C.border}`,
        '&:hover':    { bgcolor: `${color}10`, borderColor: color },
        '&:disabled': { opacity: 0.3 },
      }}>
        <AddIcon sx={{ fontSize: isLg ? 18 : 14 }} />
      </IconButton>
    </Box>
  );
};

// ── Day card (weekday / weekend average) ──────────────────────────────────────
const DayCard = ({ icon, title, subtitle, value, onChange, color }) => (
  <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, p: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: 2,
        bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography fontWeight={700} fontSize={15} color={C.text}>{title}</Typography>
        <Typography fontSize={12} color={C.muted}>{subtitle}</Typography>
      </Box>
    </Box>
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      py: 2, borderRadius: 2, bgcolor: `${color}08`, border: `1px solid ${color}20`,
    }}>
      <Stepper value={value} onChange={onChange} color={color} size="lg" />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
      <Typography fontSize={11} color={C.muted}>Min {MIN} hrs</Typography>
      <Typography fontSize={11} color={C.muted}>Max {MAX} hrs</Typography>
    </Box>
  </Paper>
);

// ── Weekly summary ────────────────────────────────────────────────────────────
const WeeklySummary = ({ days, useDetailed, detailed }) => {
  const weekdayTotal = useDetailed
    ? ['mon','tue','wed','thu','fri'].reduce((s, d) => s + detailed[d], 0)
    : days.weekdays * 5;
  const weekendTotal = useDetailed
    ? detailed.sat + detailed.sun
    : days.weekends * 2;
  const weekTotal = weekdayTotal + weekendTotal;
  const dailyAvg  = (weekTotal / 7).toFixed(1);

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, p: 2.5, bgcolor: C.primarySoft }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AccessTimeIcon sx={{ fontSize: 16, color: C.primary }} />
        <Typography fontSize={13} fontWeight={700} color={C.primary}>Weekly Summary</Typography>
      </Box>
      <Grid container spacing={2}>
        {[
          { label: 'Weekday total', value: `${weekdayTotal} hrs` },
          { label: 'Weekend total', value: `${weekendTotal} hrs` },
          { label: 'Weekly total',  value: `${weekTotal} hrs`    },
          { label: 'Daily average', value: `${dailyAvg} hrs`     },
        ].map(({ label, value }) => (
          <Grid item xs={6} key={label}>
            <Typography fontSize={11} color={C.muted}>{label}</Typography>
            <Typography fontSize={15} fontWeight={700} color={C.text}>{value}</Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

// ── Per-day label ─────────────────────────────────────────────────────────────
const DAY_LABELS = [
  { key: 'mon', label: 'Mon', color: '#4361EE' },
  { key: 'tue', label: 'Tue', color: '#4361EE' },
  { key: 'wed', label: 'Wed', color: '#4361EE' },
  { key: 'thu', label: 'Thu', color: '#4361EE' },
  { key: 'fri', label: 'Fri', color: '#4361EE' },
  { key: 'sat', label: 'Sat', color: '#F4A261' },
  { key: 'sun', label: 'Sun', color: '#F4A261' },
];

// ═════════════════════════════════════════════════════════════════════════════
const Bonboarding = () => {
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  // Average weekday / weekend hours
  const [weekdays,    setWeekdays]    = useState(4);
  const [weekends,    setWeekends]    = useState(4);

  // Per-day breakdown (optional)
  const [showDetailed, setShowDetailed] = useState(false);
  const [detailed, setDetailed] = useState({
    mon: 4, tue: 4, wed: 4, thu: 4, fri: 4, sat: 4, sun: 4,
  });

  const updateDay = (key, val) => setDetailed(prev => ({ ...prev, [key]: val }));

  // Academic
  const [courseCode, setCourseCode] = useState('');
  const [batchYear,  setBatchYear]  = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  // When detailed mode is on, derive weekdays/weekends from per-day values
  const effectiveWeekdays = showDetailed
    ? +((['mon','tue','wed','thu','fri'].reduce((s,d) => s + detailed[d], 0)) / 5).toFixed(1)
    : weekdays;
  const effectiveWeekends = showDetailed
    ? +((detailed.sat + detailed.sun) / 2).toFixed(1)
    : weekends;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/profile/onboarding`,
        {
          weekdays:   effectiveWeekdays,
          weekends:   effectiveWeekends,
          courseCode: courseCode.trim() || null,
          batchYear:  batchYear.trim()  || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
      setTimeout(() => navigate('/user/projects'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400, px: 3 }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%',
            bgcolor: '#EDFBF3', border: `2px solid ${C.success}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3,
          }}>
            <CheckCircleIcon sx={{ fontSize: 44, color: C.success }} />
          </Box>
          <Typography fontWeight={800} fontSize={24} color={C.text} mb={1}>You're all set!</Typography>
          <Typography color={C.muted} fontSize={14}>
            Your study schedule has been saved. Taking you to your projects...
          </Typography>
          <CircularProgress size={20} sx={{ mt: 3, color: C.primary }} />
        </Box>
      </Box>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg, py: 6 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', px: 3 }}>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 2,
            bgcolor: C.primarySoft, border: `1px solid ${C.primary}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
          }}>
            <SchoolIcon sx={{ fontSize: 28, color: C.primary }} />
          </Box>
          <Typography fontWeight={800} fontSize={26} color={C.text} sx={{ letterSpacing: '-0.5px' }}>
            Welcome, {user?.firstName || 'there'}! 👋
          </Typography>
          <Typography color={C.muted} fontSize={14} mt={1} maxWidth={420} mx="auto">
            Tell us how much time you can dedicate to studying each day.
            This helps generate realistic task deadlines for you.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Average cards — hidden when detailed mode is on */}
        {!showDetailed && (
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <DayCard icon={<WbSunnyIcon />} title="Weekdays" subtitle="Monday — Friday"
                value={weekdays} onChange={setWeekdays} color="#4361EE" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DayCard icon={<NightsStayIcon />} title="Weekends" subtitle="Saturday — Sunday"
                value={weekends} onChange={setWeekends} color="#F4A261" />
            </Grid>
          </Grid>
        )}

        {/* Weekly summary */}
        <Box sx={{ mb: 2.5 }}>
          <WeeklySummary
            days={{ weekdays, weekends }}
            useDetailed={showDetailed}
            detailed={detailed}
          />
        </Box>

        {/* ── Per-day breakdown toggle ── */}
        <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
          {/* Toggle header */}
          <Box
            sx={{
              px: 3, py: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: showDetailed ? C.primarySoft : C.bg,
              borderBottom: showDetailed ? `1px solid ${C.border}` : 'none',
              transition: 'background 0.2s',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TuneIcon sx={{ fontSize: 18, color: showDetailed ? C.primary : C.muted }} />
              <Box>
                <Typography fontWeight={700} fontSize={14} color={showDetailed ? C.primary : C.text}>
                  Set hours per day
                </Typography>
                <Typography fontSize={12} color={C.muted}>
                  Optional — set different hours for each day of the week
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={showDetailed}
              onChange={() => setShowDetailed(p => !p)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: C.primary },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: C.primary },
              }}
            />
          </Box>

          {/* Per-day inputs */}
          <Collapse in={showDetailed}>
            <Box sx={{ p: 3 }}>
              {/* Weekdays */}
              <Typography fontSize={12} fontWeight={700} color={C.muted} textTransform="uppercase"
                letterSpacing={0.8} mb={1.5}>
                Weekdays
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {DAY_LABELS.filter(d => ['mon','tue','wed','thu','fri'].includes(d.key)).map(({ key, label, color }) => (
                  <Grid item xs key={key}>
                    <Box sx={{
                      p: 1.5, borderRadius: 2,
                      border: `1px solid ${C.border}`,
                      bgcolor: C.surface,
                      textAlign: 'center',
                    }}>
                      <Typography fontSize={12} fontWeight={700} color={C.muted} mb={1}>{label}</Typography>
                      <Stepper value={detailed[key]} onChange={(v) => updateDay(key, v)} color={color} size="sm" />
                      <Typography fontSize={10} color={C.muted} mt={0.5}>{detailed[key]} hrs</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Weekends */}
              <Typography fontSize={12} fontWeight={700} color={C.muted} textTransform="uppercase"
                letterSpacing={0.8} mb={1.5}>
                Weekends
              </Typography>
              <Grid container spacing={1.5}>
                {DAY_LABELS.filter(d => ['sat','sun'].includes(d.key)).map(({ key, label, color }) => (
                  <Grid item xs={6} key={key}>
                    <Box sx={{
                      p: 1.5, borderRadius: 2,
                      border: `1px solid ${C.border}`,
                      bgcolor: C.surface,
                      textAlign: 'center',
                    }}>
                      <Typography fontSize={12} fontWeight={700} color={C.muted} mb={1}>{label}</Typography>
                      <Stepper value={detailed[key]} onChange={(v) => updateDay(key, v)} color={color} size="sm" />
                      <Typography fontSize={10} color={C.muted} mt={0.5}>{detailed[key]} hrs</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Derived averages note */}
              <Box sx={{ mt: 2, p: 1.5, bgcolor: C.primarySoft, borderRadius: 2 }}>
                <Typography fontSize={12} color={C.primary}>
                  <strong>Weekday average:</strong> {effectiveWeekdays} hrs/day &nbsp;·&nbsp;
                  <strong>Weekend average:</strong> {effectiveWeekends} hrs/day
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Paper>

        {/* Academic details */}
        <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 3, p: 3, mb: 3 }}>
          <Typography fontWeight={700} fontSize={14} color={C.text} mb={0.5}>
            Academic Details
            <Box component="span" sx={{ fontWeight: 400, color: C.muted, fontSize: 12, ml: 1 }}>optional</Box>
          </Typography>
          <Typography fontSize={12} color={C.muted} mb={2}>Helps personalise your experience</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Course Code" placeholder="e.g. CS301"
                value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Batch Year" placeholder="e.g. 2024"
                value={batchYear} onChange={(e) => setBatchYear(e.target.value)} />
            </Grid>
          </Grid>
        </Paper>

        {/* Submit */}
        <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={loading}
          sx={{
            py: 1.8, fontWeight: 700, fontSize: 15, borderRadius: 3,
            bgcolor: C.primary, boxShadow: `0 4px 14px ${C.primary}40`,
            '&:hover':    { bgcolor: '#3451d1' },
            '&:disabled': { bgcolor: C.border  },
          }}
        >
          {loading
            ? <><CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} />Saving...</>
            : 'Save & Get Started'
          }
        </Button>

        <Typography fontSize={12} color={C.muted} textAlign="center" mt={2}>
          You can update your study hours anytime from your profile settings.
        </Typography>

      </Box>
    </Box>
  );
};

export default Bonboarding;