import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Box, Paper,
  FormControl, Select, MenuItem, Grid, CircularProgress,
  Alert, IconButton, Divider, Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import './CreateTask.css';

const CreateTask = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    assigneeId: '',
    dueDate: null,
    taskType: 'Coding',
    status: 'New',
  });

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    if (formData.projectId) { fetchProjectMembers(formData.projectId); }
  }, [formData.projectId]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.projects || []);
    } catch (err) { setError('Failed to fetch projects'); }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectMembers(response.data.members || []);
    } catch (err) { console.error('Error fetching members:', err); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.projectId || !formData.name || !formData.assigneeId || !formData.status) {
      setError('Please fill in all mandatory fields (*)');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/tasks`, formData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (response.data.task) {
        setSuccess('Task created successfully!');
        setTimeout(() => { navigate('/user/taskboard'); }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally { setLoading(false); }
  };

  return (
    <div className="create-task-container">
      <Container maxWidth="md">
        <Paper className="form-card" sx={{ p: { xs: 3, md: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <IconButton onClick={() => navigate('/user/taskboard')} sx={{ bgcolor: '#f1f5f9' }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h5" fontWeight="800" color="#0f172a">New Task Assignment</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              
              {/* Row 1: Task Title (Single Line / Long Field) */}
              <Grid item xs={12}>
                <label className="form-label">Task Name *</label>
                <TextField fullWidth name="name" value={formData.name} onChange={handleChange} required placeholder="Enter task name..." />
              </Grid>

              {/* Row 2: Description (Single Line / Long Field) */}
              <Grid item xs={12}>
                <label className="form-label">Detailed Description</label>
                <TextField fullWidth name="description" value={formData.description} onChange={handleChange} multiline rows={3} placeholder="What needs to be done?" />
              </Grid>

              {/* Row 3: Project and Project Member (Inline) */}
              <Grid item xs={12} md={6}>
                <label className="form-label">Select Project *</label>
                <FormControl fullWidth required>
                  <Select name="projectId" value={formData.projectId} onChange={handleChange} displayEmpty>
                    <MenuItem value="" disabled>Choose a project</MenuItem>
                    {projects.map((p) => <MenuItem key={p._id} value={p._id}>{p.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <label className="form-label">Assign To *</label>
                <FormControl fullWidth required disabled={!formData.projectId}>
                  <Select name="assigneeId" value={formData.assigneeId} onChange={handleChange} displayEmpty>
                    <MenuItem value="" disabled>{formData.projectId ? 'Select Member' : 'Select Project First'}</MenuItem>
                    {projectMembers.map((m) => (
                      <MenuItem key={m.userId} value={m.userId}>{m.userId?.firstName} {m.userId?.lastName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Row 4: Task Type and Status (Inline) */}
              <Grid item xs={12} md={6}>
                <label className="form-label">Type</label>
                <FormControl fullWidth>
                  <Select name="taskType" value={formData.taskType} onChange={handleChange}>
                    <MenuItem value="Coding">Coding</MenuItem>
                    <MenuItem value="Documentation">Documentation</MenuItem>
                    <MenuItem value="Designing">Designing</MenuItem>
                    <MenuItem value="Testing">Testing</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <label className="form-label">Initial Status *</label>
                <FormControl fullWidth required>
                  <Select name="status" value={formData.status} onChange={handleChange}>
                    <MenuItem value="New">To Do</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Row 5: Deadline (Cannot be old date) */}
              <Grid item xs={12}>
                <label className="form-label">Deadline</label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={formData.dueDate}
                    minDate={new Date()} // Disables past dates
                    onChange={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Row 6: Creator Information */}
              <Grid item xs={12}>
                <Box className="creator-info-box">
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Created By:</Typography>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>{user?.firstName?.[0]}</Avatar>
                  <Typography variant="body2" fontWeight="500">{user?.firstName} {user?.lastName}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/user/taskboard')} className="btn-cancel">Cancel</Button>
              <Button type="submit" variant="contained" className="btn-submit" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Create Task'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default CreateTask;