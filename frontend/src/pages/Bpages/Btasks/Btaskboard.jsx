import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import TaskDialog from '../../../components/TaskDialog';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

const TaskBoard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0 || selectedProject === 'all') {
      fetchTasks();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedProject && selectedProject !== 'all') {
        params.projectId = selectedProject;
      }

      console.log('Fetching tasks with params:', params);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params,
      });

      console.log('Tasks API Response:', response.data);
      
      if (response.data && Array.isArray(response.data.tasks)) {
        setTasks(response.data.tasks);
      } else {
        console.warn('Unexpected response format:', response.data);
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      setError(`Failed to fetch tasks: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleCreateTask = () => {
    setIsDialogOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    // Refresh tasks after creating a new one
    fetchTasks();
    setIsDialogOpen(false);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/user/task/${taskId}`);
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return '#64748b'; // Gray
      case 'In Progress':
        return '#3b82f6'; // Blue
      case 'To Be Reviewed':
        return '#f59e0b'; // Orange
      case 'Completed':
        return '#10b981'; // Green
      default:
        return '#64748b';
    }
  };

  const filterTasks = (status) => {
    let filtered = tasks.filter((task) => task.status === status);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((task) =>
        task.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const columns = [
    { id: 'New', title: 'To Do', color: '#9bd3e6ff', count: filterTasks('New').length },
    { id: 'In Progress', title: 'In Progress', color: '#eaafe8ff', count: filterTasks('In Progress').length },
    { id: 'To Be Reviewed', title: 'To Be Reviewed', color: '#ebc67cff', count: filterTasks('To Be Reviewed').length },
    { id: 'Completed', title: 'Completed', color: '#70af9aff', count: filterTasks('Completed').length },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <TaskDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Task Board
          </Typography>
          <Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={handleCreateTask}
  sx={{
    backgroundColor: "#13a2a2ff",
    color: "#0f0101ff",
    "&:hover": {
      backgroundColor: "#037476ff", // slightly darker for hover
    },
  }}
>
  Add Task
</Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Filter by Project</InputLabel>
            <Select
              value={selectedProject}
              onChange={handleProjectChange}
              label="Filter by Project"
            >
              <MenuItem value="all">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            placeholder="Search tasks by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Kanban Board */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            minHeight: '70vh',
          }}
        >
          {columns.map((column) => (
            <Paper
              key={column.id}
              elevation={0}
              sx={{
                bgcolor: '#dfe9e9ff',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                p: 2,
              }}
            >
              {/* Column Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: column.color,
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {column.title}
                  </Typography>
                </Box>
                <Chip
                  label={column.count}
                  size="small"
                  sx={{
                    bgcolor: 'white',
                    fontWeight: 'bold',
                    minWidth: 28,
                  }}
                />
              </Box>

              {/* Tasks */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {filterTasks(column.id).map((task) => {
                  const project = projects.find((p) => p._id === task.projectId);
                  return (
                    <Card
                      key={task._id}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                        borderLeft: `4px solid ${column.color}`,
                      }}
                      onClick={() => handleTaskClick(task._id)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* Task Name */}
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ mb: 1.5 }}
                        >
                          {task.name}
                        </Typography>

                        {/* Project Name */}
                        {project && (
                          <Chip
                            label={project.title}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              mb: 1,
                              bgcolor: '#e0e7ff',
                              color: '#4f46e5',
                            }}
                          />
                        )}

                        {/* Assignee & Due Date */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 1.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: '0.75rem',
                                bgcolor: column.color,
                              }}
                            >
                              {task.assigneeId?.firstName?.[0] || 'U'}
                            </Avatar>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon
                              sx={{ fontSize: 12, color: 'text.secondary' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(task.dueDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}

                {filterTasks(column.id).length === 0 && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: 'text.secondary',
                    }}
                  >
                    <Typography variant="body2">No tasks</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </>
  );
};

export default TaskBoard;