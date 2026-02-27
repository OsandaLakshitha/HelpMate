import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  Paper,
  Skeleton,
  Stack,
  Divider,
  alpha,
  useTheme,
  AvatarGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

const Bprojectlist = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'assigned'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'dueDate'

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [filter]);

  // Filter and sort projects when dependencies change
  useEffect(() => {
    filterAndSortProjects();
  }, [searchQuery, projects, sortBy]);

  const sortProjects = (projectsToSort) => {
    const sorted = [...projectsToSort];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'dueDate':
        return sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'recent':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    const sorted = sortProjects(filtered);
    setFilteredProjects(sorted);
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter === 'mine') {
        params.mine = 'true';
      }
      // For 'assigned', we'll filter on the frontend based on memberIds

      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      let fetchedProjects = response.data.projects || [];
      
      // Log the first project to inspect its structure
      if (fetchedProjects.length > 0) {
        console.log('=== PROJECT DATA STRUCTURE ===');
        console.log('First project full data:', JSON.parse(JSON.stringify(fetchedProjects[0])));
        console.log('Creator object:', fetchedProjects[0].creator);
        console.log('Creator ID:', fetchedProjects[0].creatorId);
        console.log('Creator name fields:', {
          creatorName: fetchedProjects[0].creatorName,
          creatorName2: fetchedProjects[0]?.creator?.name,
          creatorFirstName: fetchedProjects[0]?.creator?.firstName,
          creatorLastName: fetchedProjects[0]?.creator?.lastName,
          creatorEmail: fetchedProjects[0]?.creator?.email,
          creatorUsername: fetchedProjects[0]?.creator?.username
        });
        
        // Log all projects with creator info
        console.log('All projects creator info:', fetchedProjects.map(p => ({
          id: p._id,
          title: p.title,
          creatorId: p.creatorId,
          creator: p.creator,
          creatorName: p.creatorName,
          hasCreatorObject: !!p.creator,
          creatorKeys: p.creator ? Object.keys(p.creator) : []
        })));
      }

      // If filter is 'assigned', show only projects where user is a member but not creator
      if (filter === 'assigned') {
        fetchedProjects = fetchedProjects.filter(
          (project) =>
            project.memberIds?.includes(user._id || user.id) &&
            project.creatorId !== (user._id || user.id)
        );
      }

      setProjects(fetchedProjects);
      setFilteredProjects(fetchedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCreateProject = () => {
    navigate('/user/createproject');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/user/projects/${projectId}`);
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'closed':
        return 'default';
      case 'on hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getProjectTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'coding':
        return <CodeIcon />;
      case 'documentation':
        return <DescriptionIcon />;
      default:
        return <CodeIcon />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} key={item}>
          <Skeleton 
            variant="rectangular" 
            height={150} 
            sx={{ 
              borderRadius: 2,
              minHeight: 150,
            }} 
          />
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {renderSkeleton()}
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Projects
          </Typography>
          <Typography variant="body1" >
            Manage and track all your projects in one place
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Change view">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
              sx={{ height: '40px' }}
            >
              
              
            </ToggleButtonGroup>
          </Tooltip>
          <Tooltip title="Create New Project">
            <IconButton
              color="primary"
              variant="contained"
              onClick={handleCreateProject}
  sx={{
    bgcolor: '#13a2a2ff',         // your custom background color
    color: '#ffffff',              // your icon color
    '&:hover': { bgcolor: '#035757ff' }, // hover background color
    borderRadius: 2,               // rounded corners
    px: 3,                         // horizontal padding
    textTransform: 'none',         // optional for text
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)', // subtle shadow
  }}
            >
              <AddIcon sx={{ mr: 1 }} />
              New Project
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper 
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
          bgcolor: '#efeef35c',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              
              InputProps={{
                sx: { borderRadius: 3, bgcolor: 'background.paper' },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<FilterListIcon />}
                label="Filter"
                variant="outlined"
                onClick={() => {}}
                sx={{ borderRadius: 2, px: 1 }}
              />
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': {
                     bgcolor: '#2db1b1ff',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: '#58c8c8ff',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="mine">My Projects</ToggleButton>
                <ToggleButton value="assigned">Assigned</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3} sx={{ ml: 'auto' }}>
            <TextField
              select
              fullWidth
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              SelectProps={{
                native: true,
                IconComponent: SortIcon,
                sx: { '& .MuiSelect-icon': { mr: 1 } },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                },
              }}
              variant="outlined"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name (A-Z)</option>
              <option value="dueDate">Due Date</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Showing <b>{filteredProjects.length}</b> {filteredProjects.length === 1 ? 'project' : 'projects'}
        </Typography>
      </Box>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            borderRadius: 3,
            border: `2px dashed ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.light, 0.05),
            },
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.light, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <SearchIcon color="disabled" sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No matching projects found' : 'No projects here yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {searchQuery
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : filter === 'mine'
              ? 'Get started by creating your first project.'
              : 'There are currently no projects available. Check back later or create a new one.'}
          </Typography>
          {(filter === 'mine' || filter === 'all') && !searchQuery && (
            <IconButton
              onClick={handleCreateProject}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 3,
                px: 3,
                py: 1,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Create New Project
            </IconButton>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} md={6} key={project._id} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                onClick={() => handleProjectClick(project._id)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: 320, // Fixed height
                  minHeight: 320, // Prevent collapsing
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                    borderColor: 'transparent',
                  },
                }}
              >
                <CardContent sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  flex: '1 1 auto',
                  height: '100%',
                  boxSizing: 'border-box'
                }}>
                  <Grid container spacing={1.5} sx={{ height: '100%', flexWrap: 'nowrap', flexDirection: 'column' }}>
                    {/* Project Title and Type */}
                    <Grid item xs={12} sx={{ flexShrink: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 'auto', mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getProjectTypeIcon(project.projectType)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <Typography 
                            variant="h6" 
                            fontWeight="600" 
                            noWrap
                            sx={{ 
                              color: 'text.primary',
                              mb: 0.5,
                              '&:hover': {
                                color: 'primary.main',
                              },
                            }}
                          >
                            {project.title}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Status and Complexity */}
                    <Grid item xs={12} sx={{ mt: 0.5, flexShrink: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={project.status || 'Active'}
                          color={getStatusColor(project.status)}
                          size="small"
                          variant="filled"
                          sx={{
                            bgcolor: `${getStatusColor(project.status)}.light`,
                            color: `${getStatusColor(project.status)}.dark`,
                          }}
                        />
                        <Chip
                          label={`${project.complexity || 'Medium'} Complexity`}
                          color={getComplexityColor(project.complexity)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: `${getComplexityColor(project.complexity)}.main`,
                            color: `${getComplexityColor(project.complexity)}.dark`,
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Project Details */}
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Divider sx={{ my: 0.5, borderColor: 'divider' }} />
                      <Grid container spacing={1.5} sx={{ mt: 0, height: '100%' }}>
                        {/* Created By */}
                        <Grid item xs={6} sx={{ display: 'flex', minHeight: 48 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: project.creatorId === (user._id || user.id) 
                                  ? 'primary.light' 
                                  : 'grey.200',
                                color: project.creatorId === (user._id || user.id) 
                                  ? 'primary.contrastText' 
                                  : 'text.secondary',
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {project.creatorId === (user._id || user.id) 
                                ? 'You'.charAt(0).toUpperCase() 
                                : (
                                  project.creator?.name?.charAt(0) || 
                                  project.creatorName?.charAt(0) || 
                                  project.creator?.firstName?.charAt(0) || 
                                  project.creator?.lastName?.charAt(0) || 
                                  'U'
                                ).toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                              <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                Created By
                              </Typography>
                              <Typography variant="body2" noWrap sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                {project.creatorId === (user._id || user.id)
                                  ? 'You'
                                  : project.creator?.name || 
                                    project.creatorName || 
                                    (project.creator?.firstName && project.creator?.lastName ? `${project.creator.firstName} ${project.creator.lastName}`.trim() : 
                                      project.creator?.firstName || 
                                      project.creator?.lastName || 
                                      'Unknown')}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Start Date */}
                        <Grid item xs={6} sx={{ display: 'flex', minHeight: 48 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Box 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: '8px',
                                bgcolor: 'grey.100',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary',
                                flexShrink: 0,
                              }}
                            >
                              <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                            </Box>
                            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                              <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                Start Date
                              </Typography>
                              <Typography variant="body2" noWrap sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                {formatDate(project.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Due Date */}
                        <Grid item xs={6} sx={{ display: 'flex', minHeight: 48 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Box 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: '8px',
                                bgcolor: 'grey.100',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary',
                                flexShrink: 0,
                              }}
                            >
                              <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                            </Box>
                            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                              <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                Due Date
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight="500"
                                sx={{
                                  color: project.dueDate && new Date(project.dueDate) < new Date() 
                                    ? 'error.main' 
                                    : 'inherit',
                                }}
                              >
                                {formatDate(project.dueDate)}
                                {project.dueDate && new Date(project.dueDate) < new Date() && (
                                  <Chip 
                                    label="Overdue" 
                                    size="small" 
                                    sx={{
                                      ml: 1,
                                      height: 20,
                                      fontSize: '0.6rem',
                                      fontWeight: 600,
                                      bgcolor: 'error.light',
                                      color: 'error.contrastText',
                                      '& .MuiChip-label': {
                                        px: 1,
                                        py: 0.25,
                                      },
                                    }}
                                  />
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Members Count */}
                        <Grid item xs={6} sx={{ display: 'flex', minHeight: 48 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Box 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: '8px',
                                bgcolor: 'grey.100',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary',
                                flexShrink: 0,
                              }}
                            >
                              <GroupIcon sx={{ fontSize: '1rem' }} />
                            </Box>
                            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                              <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                Team Members
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AvatarGroup 
                                  max={4}
                                  sx={{ 
                                    '& .MuiAvatar-root': { 
                                      width: 24, 
                                      height: 24, 
                                      fontSize: '0.7rem',
                                      border: '2px solid white',
                                      '&:not(:first-of-type)': {
                                        marginLeft: '-8px',
                                      },
                                    },
                                  }}
                                >
                                  {project.memberIds?.slice(0, 5).map((memberId, index) => {
                                    const uniqueKey = memberId ? `member-${memberId}` : `member-${index}`;
                                    return (
                                      <Avatar 
                                        key={uniqueKey}
                                        sx={{ 
                                          bgcolor: memberId === (user._id || user.id) 
                                            ? 'primary.light' 
                                            : 'grey.300',
                                          color: memberId === (user._id || user.id) 
                                            ? 'primary.contrastText' 
                                            : 'text.secondary',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                        }}
                                      >
                                        {memberId === (user._id || user.id) 
                                          ? 'You'.charAt(0).toUpperCase() 
                                          : String.fromCharCode(65 + (index % 26))}
                                      </Avatar>
                                    );
                                  })}
                                </AvatarGroup>
                                {project.memberIds?.length > 5 && (
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    +{project.memberIds.length - 5} more
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Bprojectlist;