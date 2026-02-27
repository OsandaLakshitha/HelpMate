import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, TextField, Button, Box, 
  MenuItem, FormControl, InputLabel, Select, 
  Paper, Divider, Chip, CircularProgress, Alert, 
  IconButton, Tooltip, Grid, FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Get user and token from AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [githubVerified, setGithubVerified] = useState(false);
  const [verifyingGithub, setVerifyingGithub] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complexity: 'Low',
    projectType: 'Coding',
    dueDate: null,
    githubRepoUrl: '',
    supervisorEmail: '',
    members: []
  });

  const [creatorComponent, setCreatorComponent] = useState('');

  const [memberForm, setMemberForm] = useState({
    email: '',
    componentName: ''
  });

  const [supervisor, setSupervisor] = useState({
    email: '',
    verified: false,
    loading: false,
    user: null
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle member input changes
  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle supervisor email change
  const handleSupervisorChange = (e) => {
    const email = e.target.value;
    setSupervisor(prev => ({
      ...prev,
      email,
      verified: false,
      user: null
    }));
    setFormData(prev => ({
      ...prev,
      supervisorEmail: email
    }));
  };

  // Verify supervisor email
  const verifySupervisor = async () => {
    if (!supervisor.email) return;
    
    setSupervisor(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get(
        `${API_URL}/api/members/verify-account?email=${encodeURIComponent(supervisor.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSupervisor(prev => ({
        ...prev,
        verified: response.data.exists,
        user: response.data.user,
        loading: false
      }));
    } catch (err) {
      console.error('Error verifying supervisor:', err);
      setSupervisor(prev => ({ ...prev, loading: false }));
      setError('Failed to verify supervisor email');
    }
  };

  // Verify GitHub repository
  const verifyGithubRepo = async () => {
    if (!formData.githubRepoUrl) return;

    setVerifyingGithub(true);
    setVerificationMessage('Verifying repository...');

    try {
      const response = await axios.get(
        `${API_URL}/api/projects/verify-repo?repoUrl=${encodeURIComponent(formData.githubRepoUrl)}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );

      setGithubVerified(response.data.valid);
      setVerificationMessage(response.data.message);
    } catch (err) {
      console.error('Error verifying GitHub repo:', err);
      setGithubVerified(false);
      setVerificationMessage(err.response?.data?.message || 'Failed to verify repository');
    } finally {
      setVerifyingGithub(false);
    }
  };

  // Add member to project
  const addMember = async () => {
    if (!memberForm.email) {
      setError('Email is required');
      return;
    }

    // Check if member already exists
    if (formData.members.some(m => m.email === memberForm.email)) {
      setError('This member is already added');
      return;
    }

    // Verify member email
    try {
      const response = await axios.get(
        `${API_URL}/api/members/verify-account?email=${encodeURIComponent(memberForm.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.data.exists) {
        setError('No account found with this email');
        return;
      }

      const newMember = {
        email: memberForm.email,
        name: response.data.user.firstName && response.data.user.lastName 
          ? `${response.data.user.firstName} ${response.data.user.lastName}`
          : response.data.user.email,
        componentName: memberForm.componentName || '',
        userId: response.data.user.id,
        verified: true
      };

      setFormData(prev => ({
        ...prev,
        members: [...prev.members, newMember]
      }));

      // Reset member form
      setMemberForm({
        email: '',
        componentName: ''
      });
      setError('');
    } catch (err) {
      console.error('Error verifying member:', err);
      setError(err.response?.data?.message || 'Failed to verify member email');
    }
  };

  // Remove member from project
  const removeMember = (email) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.email !== email)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!user) {
      setError('You must be logged in to create a project');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Authentication token not found. Please login again.');
      setLoading(false);
      return;
    }

    if (!creatorComponent.trim()) {
      setError('Please specify your component/role in the project');
      setLoading(false);
      return;
    }

    try {
      // Prepare members array with creator first
      const allMembers = [
        {
          userId: user._id || user.id,
          email: user.email,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.email,
          componentName: creatorComponent,
          verified: true
        },
        ...formData.members
      ];

      const projectData = {
        title: formData.title,
        description: formData.description,
        complexity: formData.complexity,
        projectType: formData.projectType,
        dueDate: formData.dueDate,
        githubRepoUrl: formData.githubRepoUrl,
        supervisorEmail: formData.supervisorEmail,
        githubVerified,
        creatorId: user._id || user.id,
        memberIds: allMembers.map(m => m.userId),
        members: allMembers
      };

      console.log('Creating project with data:', projectData);

      const response = await axios.post(
        `${API_URL}/api/projects`, 
        projectData, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Project created successfully!');
        setTimeout(() => {
          navigate(`/project/${response.data.project._id}`);
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Project Title */}
          <TextField
            fullWidth
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          />

          {/* Project Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            margin="normal"
            variant="outlined"
          />

          <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
            {/* Project Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Project Type</InputLabel>
                <Select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  label="Project Type"
                >
                  <MenuItem value="Coding">Coding</MenuItem>
                  <MenuItem value="Documentation">Documentation</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Complexity */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Complexity</InputLabel>
                <Select
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  label="Complexity"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Due Date */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      margin="normal" 
                      required 
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          {/* GitHub Repository */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                label="GitHub Repository URL"
                name="githubRepoUrl"
                value={formData.githubRepoUrl}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                placeholder="https://github.com/username/repository"
                helperText="Enter the full URL of your GitHub repository"
              />
              <Button
                variant="outlined"
                onClick={verifyGithubRepo}
                disabled={!formData.githubRepoUrl || verifyingGithub}
                sx={{ mt: 2, minWidth: '120px' }}
              >
                {verifyingGithub ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </Box>
            {verificationMessage && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: githubVerified ? 'success.main' : 'error.main' }}>
                {githubVerified && <VerifiedIcon color="success" sx={{ mr: 0.5 }} />}
                <Typography variant="body2">
                  {verificationMessage}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Supervisor Email */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Supervisor (Optional)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                label="Supervisor Email"
                value={supervisor.email}
                onChange={handleSupervisorChange}
                margin="normal"
                variant="outlined"
                placeholder="supervisor@example.com"
              />
              <Button
                variant="outlined"
                onClick={verifySupervisor}
                disabled={!supervisor.email || supervisor.loading}
                sx={{ mt: 2, minWidth: '120px' }}
              >
                {supervisor.loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </Box>
            {supervisor.verified && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'success.main' }}>
                <VerifiedIcon color="success" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  Verified: {supervisor.user?.name || 'Supervisor'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Team Members */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Team Members
            </Typography>

            {/* Creator's Component - Always shown first */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                border: '2px solid',
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              }}
            >
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Your Role (Project Creator)
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    disabled
                    value={user?.email || ''}
                    label="Email"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    required
                    label="Your Component/Role"
                    value={creatorComponent}
                    onChange={(e) => setCreatorComponent(e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., Backend Developer"
                    helperText="Specify your role in this project"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Creator"
                    color="primary"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Add Other Members */}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
              Add Other Team Members
            </Typography>
            
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={memberForm.email}
                  onChange={handleMemberChange}
                  margin="normal"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Component/Role"
                  name="componentName"
                  value={memberForm.componentName}
                  onChange={handleMemberChange}
                  margin="normal"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Tooltip title="Add Member">
                  <IconButton 
                    color="primary" 
                    onClick={addMember}
                    disabled={!memberForm.email}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            {/* Member List as Rows */}
            {formData.members.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Added Members ({formData.members.length})
                </Typography>
                {formData.members.map((member, index) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{
                      p: 2,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 150 }}>
                        <Typography variant="body2" color="text.secondary">
                          Component:
                        </Typography>
                        <Typography variant="body2">
                          {member.componentName || 'Not specified'}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<VerifiedIcon />}
                        label="Verified"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => removeMember(member.email)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !formData.title || !formData.dueDate || !creatorComponent.trim()}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Project'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProject;