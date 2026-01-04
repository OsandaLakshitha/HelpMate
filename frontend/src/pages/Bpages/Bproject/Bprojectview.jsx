import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [taskStats, setTaskStats] = useState([]);
  const [memberLastActive, setMemberLastActive] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [endProjectDialogOpen, setEndProjectDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    projectType: '',
    complexity: '',
    dueDate: null,
    supervisorEmail: '',
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projectResponse = await axios.get(`${API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const projectData = projectResponse.data;
      const currentUserId = user._id || user.id;

      // Check access
      const isCreator = String(projectData.project.creatorId) === String(currentUserId);
      const isMember = projectData.members?.some(member => {
        const memberId = member.userId?._id || member.userId;
        return String(memberId) === String(currentUserId);
      });

      if (!isCreator && !isMember) {
        setError('You do not have permission to view this project');
        navigate('/user/projects');
        return;
      }

      setProject(projectData.project);
      setMembers(projectData.members || []);

      // Create member last active map
      const lastActiveMap = {};
      projectData.members?.forEach(member => {
        const memberId = member.userId?._id || member.userId;
        lastActiveMap[memberId] = member.lastActive || member.userId?.lastActive;
      });
      setMemberLastActive(lastActiveMap);

      // Fetch task statistics with the members data
      await fetchTaskStatistics(projectData.members || []);

      setEditForm({
        title: projectData.project.title,
        description: projectData.project.description || '',
        projectType: projectData.project.projectType || '',
        complexity: projectData.project.complexity || '',
        dueDate: projectData.project.dueDate,
        supervisorEmail: projectData.project.supervisorEmail || '',
      });
    } catch (err) {
      console.error('Error fetching project:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch project details';
      setError(errorMessage);

      if (err.response?.status === 403 || err.response?.status === 404) {
        setTimeout(() => navigate('/user/projects'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStatistics = async (projectMembers) => {
    try {
      console.log('Fetching tasks for project:', id);

      // Fetch ALL tasks for this project ONCE
      const tasksResponse = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { projectId: id },
      });

      const allTasks = tasksResponse.data.tasks || [];
      console.log('Total tasks fetched:', allTasks.length);

      // Process statistics for each member
      const stats = projectMembers.map((member) => {
        // Extract the actual user ID (handle both populated and non-populated)
        const memberUserId = member.userId?._id || member.userId;

        console.log('Processing member:', {
          name: `${member.userId?.firstName} ${member.userId?.lastName}`,
          userId: memberUserId
        });

        // Filter tasks for this specific member
        const memberTasks = allTasks.filter((task) => {
          // Extract assignee ID (handle both populated and non-populated)
          const taskAssigneeId = task.assigneeId?._id || task.assigneeId;
          const match = String(taskAssigneeId) === String(memberUserId);
          return match;
        });

        console.log(`Member ${member.userId?.firstName} tasks:`, memberTasks.length);

        // Count tasks by status
        const todo = memberTasks.filter((t) => t.status === 'New').length;
        const inProgress = memberTasks.filter((t) => t.status === 'In Progress').length;
        const toBeReviewed = memberTasks.filter((t) => t.status === 'To Be Reviewed').length;
        const completed = memberTasks.filter((t) => t.status === 'Completed').length;

        // Calculate average completion time for completed tasks
        const completedTasks = memberTasks.filter(
          (t) => t.status === 'Completed' && t.startedAt && t.completedAt
        );

        let avgCompletionTime = null;
        if (completedTasks.length > 0) {
          const totalTime = completedTasks.reduce((sum, task) => {
            const start = new Date(task.startedAt);
            const end = new Date(task.completedAt);
            const days = (end - start) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0);
          avgCompletionTime = (totalTime / completedTasks.length).toFixed(1);
        }

        // Calculate completion percentage
        const totalAssigned = todo + inProgress + toBeReviewed + completed;
        const completionPercentage = totalAssigned > 0
          ? ((completed / totalAssigned) * 100).toFixed(1)
          : '0';

        return {
          userId: memberUserId,
          name: `${member.userId?.firstName || ''} ${member.userId?.lastName || ''}`.trim(),
          componentName: member.componentName || 'Not specified',
          todo,
          inProgress,
          toBeReviewed,
          completed,
          totalAssigned,
          avgCompletionTime: avgCompletionTime ? `${avgCompletionTime} days` : 'N/A',
          completionPercentage,
          contributionPercentage: member.contributionTotal || null,
          score: 'Pending',
          freeRiding: null,
        };
      });

      console.log('Task stats:', stats);
      setTaskStats(stats);
    } catch (err) {
      console.error('Error fetching task statistics:', err);
      setError('Failed to fetch task statistics');
    }
  };

  const handleEditOpen = () => {
    const currentUserId = user._id || user.id;
    if (String(project.creatorId) !== String(currentUserId)) {
      setError('Only the project creator can edit the project');
      return;
    }
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/projects/${id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setProject(response.data.project);
      setEditDialogOpen(false);
      setSuccess('Project updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleEndProject = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/projects/${id}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProject(response.data.project);
      setEndProjectDialogOpen(false);
      setSuccess('Project closed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error closing project:', err);
      const errorMsg = err.response?.data?.message || 'Failed to close project';
      setError(errorMsg);

      // If there are incomplete tasks, show more helpful message
      if (err.response?.data?.allowForceClose) {
        setError(`${errorMsg} Use force close if you want to close anyway.`);
      }
      setEndProjectDialogOpen(false);
    }
  };

  const handleForceEndProject = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/projects/${id}/force-close`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProject(response.data.project);
      setEndProjectDialogOpen(false);
      setSuccess('Project force closed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error force closing project:', err);
      setError(err.response?.data?.message || 'Failed to force close project');
      setEndProjectDialogOpen(false);
    }
  };

  const handleEndProjectClick = () => {
    setEndProjectDialogOpen(true);
  };

  const handleEndProjectCancel = () => {
    setEndProjectDialogOpen(false);
  };

  const handleDeleteProject = async () => {
    try {
      await axios.delete(`${API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Project deleted successfully');
      setTimeout(() => {
        navigate('/user/projects');
      }, 1500);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.response?.data?.message || 'Failed to delete project');
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;

    return 'Just now';
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const currentUserId = user?._id || user?.id;
  const isCreator = String(project?.creatorId) === String(currentUserId);
  const isProjectClosed = project?.status?.toLowerCase() === 'closed';

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">Project not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/user/projects')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Project Dashboard
        </Typography>
        {isProjectClosed && (
          <Chip label="Closed" color="default" />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Project Details Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Project Details
              </Typography>
              {isCreator && !isProjectClosed && (
                <IconButton onClick={handleEditOpen} color="primary">
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {project.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {project.description || 'No description provided'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Project Type
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {project.projectType || 'Not specified'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Complexity
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={project.complexity || 'Medium'}
                    color={getComplexityColor(project.complexity)}
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Supervisor
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {project.supervisorEmail || 'Not assigned'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Team Members
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <GroupIcon fontSize="small" color="primary" />
                  <Typography variant="body1" fontWeight="medium">
                    {members.length} members
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(project.createdAt)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(project.dueDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={project.status || 'Open'}
                    color={isProjectClosed ? 'default' : 'primary'}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>

            {isCreator && !isProjectClosed && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleEndProjectClick}
                >
                  Close Project
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  startIcon={<DeleteIcon />}
                >
                  Delete Project
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Task Summary Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Task Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Task distribution and completion metrics per member
            </Typography>

            {taskStats.length === 0 ? (
              <Alert severity="info">No task data available yet</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Member Name</strong></TableCell>
                      <TableCell><strong>Component</strong></TableCell>
                      <TableCell align="center"><strong>To Do</strong></TableCell>
                      <TableCell align="center"><strong>In Progress</strong></TableCell>
                      <TableCell align="center"><strong>To Review</strong></TableCell>
                      <TableCell align="center"><strong>Completed</strong></TableCell>
                      <TableCell align="center"><strong>Total</strong></TableCell>
                      <TableCell align="center"><strong>Completion %</strong></TableCell>
                      <TableCell align="center"><strong>Last Active</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taskStats.map((stat) => (
                      <TableRow key={stat.userId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {stat.name?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            {stat.name || 'Unknown'}
                          </Box>
                        </TableCell>
                        <TableCell>{stat.componentName}</TableCell>
                        <TableCell align="center">
                          <Chip label={stat.todo} size="small" sx={{ bgcolor: '#64748b', color: 'white' }} />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={stat.inProgress} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={stat.toBeReviewed} size="small" color="warning" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={stat.completed} size="small" color="success" />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {stat.totalAssigned}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {stat.completionPercentage}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary" title={memberLastActive[stat.userId] ? new Date(memberLastActive[stat.userId]).toLocaleString() : 'Never'}>
                            {formatTimeAgo(memberLastActive[stat.userId])}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Project Overview Card - ML Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Contribution Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              AI-powered contribution and fairness metrics
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Member Name</strong></TableCell>
                    <TableCell><strong>Component</strong></TableCell>
                    <TableCell align="center"><strong>Contribution %</strong></TableCell>
                    <TableCell align="center"><strong>Score</strong></TableCell>
                    <TableCell align="center"><strong>Free Riding</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taskStats.map((stat) => (
                    <TableRow key={stat.userId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {stat.name?.[0]?.toUpperCase() || 'U'}
                          </Avatar>
                          {stat.name || 'Unknown'}
                        </Box>
                      </TableCell>
                      <TableCell>{stat.componentName}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {stat.contributionPercentage || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={stat.score}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {stat.freeRiding || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Contribution percentage, Score, and Free Riding detection 
                will be calculated using ML models once the project is closed.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            multiline
            rows={3}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Project Type</InputLabel>
            <Select
              value={editForm.projectType}
              onChange={(e) => setEditForm({ ...editForm, projectType: e.target.value })}
              label="Project Type"
            >
              <MenuItem value="Coding">Coding</MenuItem>
              <MenuItem value="Documentation">Documentation</MenuItem>
              <MenuItem value="Both">Both</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Complexity</InputLabel>
            <Select
              value={editForm.complexity}
              onChange={(e) => setEditForm({ ...editForm, complexity: e.target.value })}
              label="Complexity"
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Supervisor Email"
            value={editForm.supervisorEmail}
            onChange={(e) => setEditForm({ ...editForm, supervisorEmail: e.target.value })}
            margin="normal"
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={editForm.dueDate}
              onChange={(date) => setEditForm({ ...editForm, dueDate: date })}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Project Confirmation Dialog */}
      <Dialog open={endProjectDialogOpen} onClose={handleEndProjectCancel}>
        <DialogTitle>Close Project</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to close this project? This will mark the project as completed.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            All tasks must be completed before closing. If you have incomplete tasks, 
            they must be completed or you can use "Force Close".
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEndProjectCancel}>Cancel</Button>
          <Button onClick={handleForceEndProject} variant="outlined" color="error">
            Force Close
          </Button>
          <Button onClick={handleEndProject} variant="contained" color="warning">
            Close Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete this project? All tasks and member data 
            will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} variant="contained" color="error">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectView;