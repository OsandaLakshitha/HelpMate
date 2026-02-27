import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const TaskDialog = ({ open, onClose, onTaskCreated }) => {
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

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  useEffect(() => {
    if (formData.projectId) {
      fetchProjectMembers(formData.projectId);
    } else {
      setProjectMembers([]);
      setFormData(prev => ({ ...prev, assigneeId: '' }));
    }
  }, [formData.projectId]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.projects || []);
    } catch (err) {
      setError('Failed to fetch projects');
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectMembers(response.data.members || []);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to fetch project members');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setError(''); if (!formData.projectId || !formData.name || !formData.assigneeId || !formData.status) { setError('Please fill in all mandatory fields (*)'); setLoading(false); return; } try { const response = await axios.post(`${API_URL}/api/tasks`, formData, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, }); if (response.data.task) { setSuccess('Task created successfully!'); if (onTaskCreated) { onTaskCreated(response.data.task); } // 🔑 NEW: Log the interaction 
  await axios.post(`${API_URL}/api/interactions`, { projectId: response.data.task.projectId, userId: user._id, type: 'task_update' }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, }); setTimeout(() => { onClose(); setFormData({ projectId: '', name: '', description: '', assigneeId: '', dueDate: null, taskType: 'Coding', status: 'New', }); setSuccess(''); }, 1000); } } catch (err) { setError(err.response?.data?.message || 'Failed to create task'); } finally { setLoading(false); } };
  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">New Task Assignment</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Task Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
              variant="outlined"
            />

            <FormControl fullWidth margin="normal" required>
              <label>Project *</label>
              <Select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                displayEmpty
                variant="outlined"
              >
                <MenuItem value="" disabled>Select Project</MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p._id} value={p._id}>{p.title}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <label>Assign To *</label>
              <Select
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                displayEmpty
                disabled={!formData.projectId}
                variant="outlined"
              >
                <MenuItem value="" disabled>
                  {formData.projectId ? 'Select Member' : 'Select Project First'}
                </MenuItem>
                {projectMembers.map((m) => (
                  <MenuItem key={m.userId} value={m.userId}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                        {m.userId?.firstName?.[0]}
                      </Avatar>
                      {m.userId?.firstName} {m.userId?.lastName}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <FormControl fullWidth margin="normal">
                <label>Type</label>
                <Select
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="Coding">Coding</MenuItem>
                  <MenuItem value="Documentation">Documentation</MenuItem>
                  <MenuItem value="Designing">Designing</MenuItem>
                  <MenuItem value="Testing">Testing</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" required>
                <label>Status *</label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="New">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth margin="normal">
              <label>Deadline</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={formData.dueDate}
                  minDate={new Date()}
                  onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </LocalizationProvider>
            </FormControl>

            <Box sx={{ 
              mt: 1, 
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="caption" color="text.secondary">Created by:</Typography>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                {user?.firstName?.[0]}
              </Avatar>
              <Typography variant="body2">
                {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskDialog;
