import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Container, Typography, TextField, Button, Box,
  MenuItem, FormControl, InputLabel, Select,
  Paper, Divider, Chip, CircularProgress, Alert,
  IconButton, Grid, Avatar, LinearProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#F7F8FC',
  surface:   '#FFFFFF',
  border:    '#E4E7EF',
  primary:   '#4361EE',
  primarySoft:'#EEF1FD',
  success:   '#2DC76D',
  successSoft:'#EDFBF3',
  error:     '#F03E3E',
  errorSoft: '#FFF0F0',
  text:      '#1A1D2E',
  muted:     '#6B7280',
  accent:    '#F4A261',
};

// ── Section card wrapper ──────────────────────────────────────────────────────
const Section = ({ icon, title, subtitle, children }) => (
  <Paper
    elevation={0}
    sx={{
      border: `1px solid ${C.border}`,
      borderRadius: 3,
      overflow: 'hidden',
      mb: 3,
    }}
  >
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

// ── Avatar initials ───────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const avatarColor = (str = '') => {
  const colors = ['#4361EE','#F4A261','#2DC76D','#E63946','#9B5DE5','#00B4D8'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

// ── Main Component ────────────────────────────────────────────────────────────
const CreateProject = () => {
  const navigate  = useNavigate();
  const { user, token } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [errors,   setErrors]   = useState({});

  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    approach:    '',
    complexity:  'Low',
    projectType: 'Documentation',
    dueDate:     null,
    members:     [],
  });

  const [creatorComponent, setCreatorComponent] = useState('');
  const [memberForm, setMemberForm] = useState({ email: '', componentName: '' });
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError,   setMemberError]   = useState('');

  const [pdfFile, setPdfFile]   = useState(null);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.title.trim())          e.title          = 'Project title is required';
    if (formData.title.trim().length > 100) e.title       = 'Title must be under 100 characters';
    if (!formData.dueDate)               e.dueDate        = 'Due date is required';
    if (formData.dueDate && new Date(formData.dueDate) <= new Date()) e.dueDate = 'Due date must be in the future';
    if (!creatorComponent.trim())        e.creatorComponent = 'Your component/role is required';
    if (!formData.approach.trim())       e.approach       = 'Please describe your group\'s plan';
    if (!pdfFile)                        e.pdf            = 'Assignment PDF is required';
    if (formData.members.length === 0)   e.members        = 'Add at least one other team member';
    //if (formData.members.length > 3)     e.members        = 'Maximum 3 additional members (4 total including you)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, pdf: 'Only PDF files are allowed' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, pdf: 'PDF must be under 10MB' }));
      return;
    }
    setPdfFile(file);
    setErrors(prev => ({ ...prev, pdf: '' }));
  };

  const addMember = async () => {
    setMemberError('');
    if (!memberForm.email.trim()) { setMemberError('Email is required'); return; }

    // Block creator adding themselves
    if (memberForm.email.toLowerCase() === user?.email?.toLowerCase()) {
      setMemberError('You are already added as the project creator');
      return;
    }

    // Block duplicate
    if (formData.members.some(m => m.email.toLowerCase() === memberForm.email.toLowerCase())) {
      setMemberError('This member is already added');
      return;
    }

    // Max 3 additional members
    //if (formData.members.length >= 3) {
    //  setMemberError('Maximum 3 additional members allowed');
    //  return;
   // }

    setMemberLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/members/verify-account?email=${encodeURIComponent(memberForm.email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.exists) { setMemberError('No account found with this email'); return; }

      const u = res.data.user;
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, {
          email:         memberForm.email,
          name:          u.name || memberForm.email,
          componentName: memberForm.componentName || '',
          userId:        u.id,
          verified:      true,
        }],
      }));
      setMemberForm({ email: '', componentName: '' });
      setErrors(prev => ({ ...prev, members: '' }));
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to verify email');
    } finally {
      setMemberLoading(false);
    }
  };

  const removeMember = (email) =>
    setFormData(prev => ({ ...prev, members: prev.members.filter(m => m.email !== email) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setLoading(true);
    try {
      const allMembers = [
        {
          userId:        user._id || user.id,
          email:         user.email,
          name:          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          componentName: creatorComponent,
          verified:      true,
        },
        ...formData.members,
      ];

      // Use FormData so PDF file goes through multipart
      const fd = new FormData();
      fd.append('title',       formData.title);
      fd.append('description', formData.description);
      fd.append('approach',    formData.approach);
      fd.append('complexity',  formData.complexity);
      fd.append('projectType', formData.projectType);
      fd.append('dueDate',     formData.dueDate.toISOString());
      fd.append('members',     JSON.stringify(allMembers));
      fd.append('memberIds',   JSON.stringify(allMembers.map(m => m.userId)));
      if (pdfFile) fd.append('assignmentPdf', pdfFile);

      const res = await axios.post(`${API_URL}/api/projects`, fd, {
        headers: { Authorization: `Bearer ${token}` },
        // Do NOT set Content-Type — browser sets it with boundary automatically
      });

      if (res.data.success) {
        setSuccess('Project created successfully! Redirecting...');
        setTimeout(() => navigate(`/project/${res.data.project._id}`), 1500);
      } else {
        setError(res.data.message || 'Failed to create project');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: C.bg, minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md">

        {/* ── Header ── */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            color={C.text}
            sx={{ letterSpacing: '-0.5px' }}
          >
            Create New Project
          </Typography>
          <Typography color={C.muted} mt={0.5}>
            Fill in the details below to set up your group assignment project.
          </Typography>
        </Box>

        {/* ── Alerts ── */}
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Project Details ── */}
          <Section icon={<AssignmentIcon />} title="Project Details" subtitle="Basic information about your assignment">

            <TextField
              fullWidth required
              label="Project Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title || `${formData.title.length}/100`}
              inputProps={{ maxLength: 100 }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth multiline rows={3}
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief overview of the project..."
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth required multiline rows={3}
              label="Your Group's Approach"
              name="approach"
              value={formData.approach}
              onChange={handleChange}
              error={!!errors.approach}
              helperText={errors.approach || "What does your group plan to build or research? This helps generate better tasks."}
              placeholder="e.g., We plan to build a web application that tracks student attendance using facial recognition..."
              sx={{ mb: 2.5 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Project Type</InputLabel>
                  <Select name="projectType" value={formData.projectType} onChange={handleChange} label="Project Type">
                    <MenuItem value="Coding">Coding</MenuItem>
                    <MenuItem value="Documentation">Documentation</MenuItem>
                    <MenuItem value="Both">Both</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Complexity</InputLabel>
                  <Select name="complexity" value={formData.complexity} onChange={handleChange} label="Complexity">
                    <MenuItem value="Low">🟢 Low</MenuItem>
                    <MenuItem value="Medium">🟡 Medium</MenuItem>
                    <MenuItem value="High">🔴 High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date *"
                    value={formData.dueDate}
                    minDate={new Date()}
                    onChange={(date) => {
                      setFormData(prev => ({ ...prev, dueDate: date }));
                      setErrors(prev => ({ ...prev, dueDate: '' }));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dueDate,
                        helperText: errors.dueDate,
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Section>

          {/* ── Section 2: Assignment PDF ── */}
          <Section icon={<PictureAsPdfIcon />} title="Assignment Brief" subtitle="Upload your assignment PDF — used to generate personalised tasks">

            {!pdfFile ? (
              <Box
                component="label"
                htmlFor="pdf-upload"
                sx={{
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent:'center',
                  gap:           1,
                  p:             4,
                  border:        `2px dashed ${errors.pdf ? C.error : C.border}`,
                  borderRadius:  3,
                  bgcolor:       errors.pdf ? C.errorSoft : C.bg,
                  cursor:        'pointer',
                  transition:    'all 0.2s',
                  '&:hover':     { borderColor: C.primary, bgcolor: C.primarySoft },
                }}
              >
                <UploadFileIcon sx={{ fontSize: 40, color: errors.pdf ? C.error : C.muted }} />
                <Typography fontWeight={600} color={errors.pdf ? C.error : C.text}>
                  Click to upload PDF
                </Typography>
                <Typography fontSize={12} color={C.muted}>
                  Maximum file size: 10MB
                </Typography>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handlePdf}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         2,
                  p:           2,
                  border:      `1px solid ${C.success}`,
                  borderRadius: 2,
                  bgcolor:     C.successSoft,
                }}
              >
                <PictureAsPdfIcon sx={{ color: C.error, fontSize: 36 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600} fontSize={14} color={C.text}>
                    {pdfFile.name}
                  </Typography>
                  <Typography fontSize={12} color={C.muted}>
                    {(pdfFile.size / 1024).toFixed(0)} KB
                  </Typography>
                </Box>
                <Chip label="Ready" color="success" size="small" icon={<VerifiedIcon />} />
                <IconButton size="small" onClick={() => setPdfFile(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {errors.pdf && (
              <Typography fontSize={12} color={C.error} mt={1}>{errors.pdf}</Typography>
            )}
          </Section>

          {/* ── Section 3: Team Members ── */}
          <Section
            icon={<GroupsIcon />}
            title="Team Members"
            subtitle={`${formData.members.length + 1} members — you + teammates`}
          >

            {/* Creator card — always first, cannot be removed */}
            <Box
              sx={{
                display:       'flex',
                alignItems:    'center',
                gap:           2,
                p:             2,
                mb:            2,
                border:        `2px solid ${C.primary}`,
                borderRadius:  2,
                bgcolor:       C.primarySoft,
              }}
            >
              <Avatar sx={{ bgcolor: avatarColor(user?.email || ''), width: 40, height: 40, fontSize: 14 }}>
                {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight={700} fontSize={14} color={C.text}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Chip label="You (Creator)" size="small" color="primary" sx={{ height: 20, fontSize: 11 }} />
                </Box>
                <Typography fontSize={12} color={C.muted}>{user?.email}</Typography>
              </Box>
              <TextField
                required
                size="small"
                label="Your Component / Role"
                value={creatorComponent}
                onChange={(e) => {
                  setCreatorComponent(e.target.value);
                  setErrors(prev => ({ ...prev, creatorComponent: '' }));
                }}
                error={!!errors.creatorComponent}
                helperText={errors.creatorComponent}
                placeholder="e.g. Backend Developer"
                sx={{ minWidth: 220 }}
              />
            </Box>

            {/* Added members list */}
            {formData.members.map((member, i) => (
              <Box
                key={i}
                sx={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          2,
                  p:            2,
                  mb:           1.5,
                  border:       `1px solid ${C.border}`,
                  borderRadius: 2,
                  bgcolor:      C.surface,
                }}
              >
                <Avatar sx={{ bgcolor: avatarColor(member.email), width: 40, height: 40, fontSize: 14 }}>
                  {getInitials(member.name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600} fontSize={14} color={C.text}>{member.name}</Typography>
                  <Typography fontSize={12} color={C.muted}>{member.email}</Typography>
                </Box>
                <Chip
                  label={member.componentName || 'No role set'}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 11 }}
                />
                <Chip icon={<VerifiedIcon />} label="Verified" color="success" size="small" variant="outlined" sx={{ fontSize: 11 }} />
                <IconButton size="small" color="error" onClick={() => removeMember(member.email)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            {/* Add member form */}
            {formData.members.length < 3 && (
              <Box
                sx={{
                  mt:           2,
                  p:            2.5,
                  border:       `1px dashed ${errors.members ? C.error : C.border}`,
                  borderRadius: 2,
                  bgcolor:      C.bg,
                }}
              >
                <Typography fontSize={13} fontWeight={600} color={C.muted} mb={1.5}>
                  Add Team Member
                </Typography>
                <Grid container spacing={1.5} alignItems="flex-start">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth size="small"
                      label="Email address"
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => {
                        setMemberForm(prev => ({ ...prev, email: e.target.value }));
                        setMemberError('');
                      }}
                      placeholder="teammate@example.com"
                      error={!!memberError}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth size="small"
                      label="Component / Role"
                      value={memberForm.componentName}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, componentName: e.target.value }))}
                      placeholder="e.g. Frontend Developer"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={addMember}
                      disabled={!memberForm.email || memberLoading}
                      sx={{ height: 40, bgcolor: C.primary, '&:hover': { bgcolor: '#3451d1' } }}
                    >
                      {memberLoading
                        ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                        : <AddIcon />
                      }
                    </Button>
                  </Grid>
                </Grid>

                {memberError && (
                  <Typography fontSize={12} color={C.error} mt={1}>{memberError}</Typography>
                )}
              </Box>
            )}

            {errors.members && (
              <Typography fontSize={12} color={C.error} mt={1}>{errors.members}</Typography>
            )}

            
          </Section>

          {/* ── Footer actions ── */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
              sx={{ px: 4, borderColor: C.border, color: C.muted, '&:hover': { borderColor: C.primary, color: C.primary } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                px: 5, fontWeight: 700,
                bgcolor:    C.primary,
                boxShadow:  `0 4px 14px ${C.primary}40`,
                '&:hover':  { bgcolor: '#3451d1', boxShadow: `0 6px 20px ${C.primary}60` },
                '&:disabled':{ bgcolor: C.border },
              }}
            >
              {loading
                ? <><CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} /> Creating...</>
                : 'Create Project'
              }
            </Button>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default CreateProject;