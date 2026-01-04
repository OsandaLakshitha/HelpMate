import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper, Grid, TextField,
  InputAdornment, CircularProgress, Alert, Card, CardContent,
  Avatar, Chip, Stack, IconButton, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import './Bprojecttask.css';

const ProjectTaskBoard = () => {
  const { projectId } = useParams(); // URL: /projects/:projectId/tasks
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectAndTasks();
    }
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    setLoading(true);
    try {
      // Parallel fetch for project details and tasks
      const [projRes, taskRes] = await Promise.all([
        axios.get(`${API_URL}/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { projectId }
        })
      ]);

      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks || []);
    } catch (err) {
      setError('Failed to load project data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    // Pass projectId in state or query so the creation form knows where it belongs
    navigate(`/user/taskboard/${projectId}/addtask`, { state: { preSelectedProjectId: projectId } });
  };

  const filterTasks = (status) => {
    return tasks.filter(task => 
      task.status === status && 
      task.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const columns = [
    { id: 'New', title: 'To Do', color: '#64748b' },
    { id: 'In Progress', title: 'In Progress', color: '#3b82f6' },
    { id: 'To Be Reviewed', title: 'In Review', color: '#f59e0b' },
    { id: 'Completed', title: 'Completed', color: '#10b981' }
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* 1. Project-Specific Header */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <IconButton onClick={() => navigate('/user/taskboard')}>
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">{project?.title}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {project?.description}
              </Typography>
              {project?.repositoryUrl && (
                <Chip 
                  icon={<GitHubIcon sx={{ fontSize: '1rem !important' }} />} 
                  label="Repository Linked" 
                  size="small" 
                  variant="outlined" 
                  color="success" 
                />
              )}
            </Stack>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleCreateTask}
              sx={{ px: 3 }}
            >
              New Task
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Search Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search within this project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
            sx: { borderRadius: 2, bgcolor: 'background.paper' }
          }}
        />
      </Box>

      {/* 3. Kanban Board */}
      <Grid container spacing={2} sx={{ minHeight: '60vh' }}>
        {columns.map((column) => (
          <Grid item xs={12} sm={6} md={3} key={column.id}>
            <Box sx={{ 
              bgcolor: '#f1f5f9', 
              borderRadius: 3, 
              p: 2, 
              height: '100%',
              border: '1px solid #e2e8f0'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 1 }}>
                <Typography variant="subtitle1" fontWeight="700">
                  {column.title}
                </Typography>
                <Chip label={filterTasks(column.id).length} size="small" sx={{ fontWeight: 'bold' }} />
              </Stack>

              <Stack spacing={2}>
                {filterTasks(column.id).map((task) => (
                  <Card 
                    key={task._id} 
                    onClick={() => navigate(`/user/task/${task._id}`)}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      borderLeft: `5px solid ${column.color}`,
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                      transition: '0.2s'
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" fontWeight="600" gutterBottom>
                        {task.name}
                      </Typography>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                          {task.assigneeId?.firstName?.[0]}
                        </Avatar>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProjectTaskBoard;