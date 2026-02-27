import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Autocomplete,
  Stack,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import GitHubIcon from '@mui/icons-material/GitHub';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

const TaskView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [commits, setCommits] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [proofReviewed, setProofReviewed] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    status: '',
  });

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  useEffect(() => {
    if (project?._id) {
      fetchCommits();
      fetchProjectMembers();
    }
  }, [project]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const taskResponse = await axios.get(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const taskData = taskResponse.data.task;
      setTask(taskData);
      setProofReviewed(taskData.proofReviewed || false);

      // Log the view interaction
      await axios.post(
        `${API_URL}/api/interactions`,
        {
          projectId: taskData.projectId,
          userId: user._id,
          type: 'view',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const projectResponse = await axios.get(
        `${API_URL}/api/projects/${taskData.projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setProject(projectResponse.data.project);
      
      setEditForm({
        name: taskData.name,
        description: taskData.description,
        assigneeId: taskData.assigneeId,
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate).toISOString().split('T')[0]
          : '',
        status: taskData.status,
      });
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/tasks/project/${project._id}/commits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommits(response.data.commits || []);
    } catch (err) {
      console.error('Error fetching commits:', err);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects/${project._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectMembers(response.data.members || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const handleEditToggle = () => {
    if (task.status === 'Completed') {
      setError('Completed tasks are locked and cannot be edited');
      return;
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        assigneeId: editForm.assigneeId,
        dueDate: editForm.dueDate,
      };

      const response = await axios.patch(
        `${API_URL}/api/tasks/${id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTask(response.data.task);
      setIsEditing(false);
      setSuccess('Task updated successfully');
      
      // Log the task update interaction
      await axios.post(
        `${API_URL}/api/interactions`,
        {
          projectId: response.data.task.projectId,
          userId: user._id,
          type: 'task_update',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStatusChange = async (newStatus) => {
    // Validate To Be Reviewed → Completed transition
    if (newStatus === 'Completed') {
      if (task.status !== 'To Be Reviewed') {
        setError('Tasks must be in "To Be Reviewed" status before completion');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Check if there are any proofs
      if (!task.proofFiles?.length && !task.proofCommits?.length) {
        setError('Cannot complete task without any proof submissions');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Check if creator has checked the review box
      if (!proofReviewed) {
        setError('Please review and approve all proofs before completing this task');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Only creator can mark as completed
      if (!isCreator()) {
        setError('Only the task creator can complete this task');
        setTimeout(() => setError(''), 3000);
        return;
      }
    }

    try {
      const response = await axios.patch(
        `${API_URL}/api/tasks/${id}/status`,
        {
          status: newStatus,
          proofReviewed: newStatus === 'Completed' ? true : proofReviewed,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTask(response.data.task);
      setEditForm({ ...editForm, status: newStatus });
      setSuccess(`Task status changed to ${newStatus}`);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        `${API_URL}/api/tasks/${id}/proofs/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setTask(response.data.task);
      setSelectedFile(null);
      setShowFileUploadDialog(false);
      setSuccess('Proof file uploaded successfully');

      // Log the proof file upload
      await axios.post(
        `${API_URL}/api/interactions`,
        {
          projectId: response.data.task.projectId,
          userId: user._id,
          type: 'file_upload',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddCommitProof = async () => {
    if (!selectedCommit) {
      setError('Please select a commit');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/tasks/${id}/proofs/commits`,
        { sha: selectedCommit.sha },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTask(response.data.task);
      setSelectedCommit(null);
      setShowCommitDialog(false);
      setSuccess('Commit proof added successfully');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding commit:', err);
      setError(err.response?.data?.message || 'Failed to add commit proof');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownloadFile = async (fileUrl) => {
    try {
      // Extract just the filename from the path
      const getFileName = (url) => {
        if (!url) return 'Unknown file';
        return url.split(/[\\/]/).pop();
      };

      const filename = getFileName(fileUrl);
      
      // Create a direct download link to the file
      const downloadUrl = `${API_URL}/uploads/${filename}`;
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      
      // Add to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Download error:', err);
      setError("Failed to download file. Please try again.");
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleViewImage = (url) => {
    setPreviewImageUrl(url);
    setShowImagePreview(true);
  };

  const isCreator = () => {
    return String(task?.assignedById?._id || task?.assignedById) === String(user._id || user.id);
  };

  const getAvailableStatusOptions = () => {
    const currentStatus = task?.status;

    switch (currentStatus) {
      case 'New':
        return ['In Progress'];
      case 'In Progress':
        return ['New', 'To Be Reviewed'];
      case 'To Be Reviewed':
        return isCreator() ? ['In Progress', 'Completed'] : ['In Progress'];
      case 'Completed':
        return [];
      default:
        return [];
    }
  };

  const showProofFields = () => {
    return (
      task?.status === 'In Progress' ||
      task?.status === 'To Be Reviewed' ||
      task?.status === 'Completed'
    );
  };

  const canEditProofs = () => {
    return task?.status === 'In Progress' || task?.status === 'To Be Reviewed';
  };

  const getFileName = (url) => {
    if (!url) return 'Unknown file';
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon color="primary" />;
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      default:
        return <InsertDriveFileIcon color="action" />;
    }
  };

  const isImageFile = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return '#9bd3e6ff';
      case 'In Progress':
        return '#eaafe8ff';
      case 'To Be Reviewed':
        return '#ebc67cff';
      case 'Completed':
        return '#70af9aff';
      default:
        return '#64748b';
    }
  };

  const getActiveStep = () => {
    const statusMap = {
      New: 0,
      'In Progress': 1,
      'To Be Reviewed': 2,
      Completed: 3,
    };
    return statusMap[task?.status] || 0;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Task not found</Alert>
      </Container>
    );
  }

  const isCompleted = task.status === 'Completed';
  const isInReview = task.status === 'To Be Reviewed';
  const availableStatuses = getAvailableStatusOptions();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/user/taskboard')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {isEditing ? (
              <TextField
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                variant="standard"
                fullWidth
                sx={{ fontSize: '2rem', fontWeight: 'bold' }}
              />
            ) : (
              task.name
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {project?.title}
          </Typography>
        </Box>
        <Chip
          label={task.status}
          sx={{
            bgcolor: getStatusColor(task.status),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            px: 2,
          }}
        />
        {isCompleted && (
          <Tooltip title="Task is locked">
            <LockIcon color="action" />
          </Tooltip>
        )}
        {!isCompleted && (
          <Button
            variant={isEditing ? 'contained' : 'outlined'}
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={isEditing ? handleSaveChanges : handleEditToggle}
            color={isEditing ? 'primary' : 'inherit'}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
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

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          <Step>
            <StepLabel>To Do</StepLabel>
          </Step>
          <Step>
            <StepLabel>In Progress</StepLabel>
          </Step>
          <Step>
            <StepLabel>To Be Reviewed</StepLabel>
          </Step>
          <Step>
            <StepLabel>Completed</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Task Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Task Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  variant="outlined"
                />
              ) : (
                <Typography variant="body1">
                  {task.description || 'No description provided'}
                </Typography>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Project
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {project?.title}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Assigned To
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={editForm.assigneeId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, assigneeId: e.target.value })
                      }
                    >
                      {projectMembers.map((member) => (
                        <MenuItem key={member.userId?._id} value={member.userId?._id}>
                          {member.userId?.firstName} {member.userId?.lastName} (
                          {member.componentName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                      {task.assigneeId?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {task.assigneeId?.firstName} {task.assigneeId?.lastName}
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created By
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                    {task.assignedById?.firstName?.[0]}
                  </Avatar>
                  <Typography variant="body1" fontWeight="medium">
                    {task.assignedById?.firstName} {task.assignedById?.lastName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                {isEditing ? (
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dueDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(task.dueDate)}
                  </Typography>
                )}
              </Grid>

              {task.startedAt && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Started At
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(task.startedAt)}
                  </Typography>
                </Grid>
              )}

              {task.progressAt && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Moved to Review At
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(task.progressAt)}
                  </Typography>
                </Grid>
              )}

              {task.completedAt && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Completed At
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(task.completedAt)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Proofs Section */}
          {showProofFields() && (
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Task Proofs
                </Typography>
                {(task.proofFiles?.length > 0 || task.proofCommits?.length > 0) && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label={`${
                      (task.proofFiles?.length || 0) + (task.proofCommits?.length || 0)
                    } Evidence Submitted`}
                    color="success"
                    size="small"
                  />
                )}
              </Box>

              {canEditProofs() && !isCompleted && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setShowFileUploadDialog(true)}
                  >
                    Upload File
                  </Button>
                  {project?.githubRepoUrl && (
                    <Button
                      variant="outlined"
                      startIcon={<GitHubIcon />}
                      onClick={() => setShowCommitDialog(true)}
                    >
                      Add Commit
                    </Button>
                  )}
                </Stack>
              )}

              {/* Files */}
              {task.proofFiles?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Uploaded Files ({task.proofFiles.length})
                  </Typography>
                  <Stack spacing={1.5}>
                    {task.proofFiles.map((file, index) => (
                      <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            py: 2,
                          }}
                        >
                          {getFileIcon(file.type)}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {getFileName(file.url)}
                            </Typography>
                            <Chip
                              label={file.type || 'file'}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Stack direction="row" spacing={1}>
                            {isImageFile(file.url) && (
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewImage(file.url)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleDownloadFile(file.url)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Commits */}
              {task.proofCommits?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Commit Proofs ({task.proofCommits.length})
                  </Typography>
                  <Stack spacing={1.5}>
                    {task.proofCommits.map((commit, index) => (
                      <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <GitHubIcon fontSize="small" color="action" />
                            <Chip
                              label={commit.sha?.substring(0, 7)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                            {commit.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {commit.authorName} • {formatDate(commit.authoredAt)}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {!task.proofFiles?.length && !task.proofCommits?.length && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No proofs submitted yet. Add files or commits to validate your work.
                </Alert>
              )}
            </Paper>
          )}
        </Grid>

        {/* Sidebar - Status Control */}
       {/* Sidebar - Status Control */}
<Grid item xs={12} md={4}>
  <Paper
    sx={{
      p: 3,
      position: 'sticky',
      top: 20,
      borderTop: `4px solid ${getStatusColor(task.status)}`,
    }}
  >
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      Status Control
    </Typography>
    <Divider sx={{ mb: 3 }} />

    {/* Conditionally Render Review Box for Creator or Message for Member */}
    {isInReview && (
      isCreator() ? (
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 2,
            bgcolor: proofReviewed ? '#e8f5e9' : '#fff8e1',
            border: proofReviewed ? '2px solid #66bb6a' : '2px solid #ffb74d',
            transition: 'all 0.3s ease',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={proofReviewed}
                onChange={(e) => setProofReviewed(e.target.checked)}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Review Confirmation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  I have reviewed all submitted proofs and approve this task
                </Typography>
              </Box>
            }
          />
        </Box>
      ) : (
        /* Message shown only to non-creators */
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              Waiting for task creator to confirm that you completed the task.
            </Typography>
          </Alert>
        </Box>
      )
    )}

    {/* Status Dropdown Logic */}
    {isCompleted ? (
      <Alert severity="success" icon={<CheckCircleIcon fontSize="large" />} sx={{ borderRadius: 2 }}>
        <Typography variant="body1" fontWeight="bold">Task Completed</Typography>
      </Alert>
    ) : (
      <Box>
        <FormControl fullWidth>
          <InputLabel>Update Status</InputLabel>
          <Select
            value={task.status}
            label="Update Status"
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {/* The dropdown options are already filtered by your getAvailableStatusOptions function */}
            <MenuItem value={task.status} disabled>{task.status}</MenuItem>
            {getAvailableStatusOptions().map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    )}
  </Paper>
</Grid>
      </Grid>

      {/* File Upload Dialog */}
      <Dialog open={showFileUploadDialog} onClose={() => setShowFileUploadDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Upload Work Proof</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ py: 4, borderStyle: 'dashed' }}
            >
              {selectedFile ? selectedFile.name : 'Click to Select File'}
              <input
                type="file"
                hidden
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Upload images, PDFs, or documents as evidence.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowFileUploadDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleFileUpload} 
            variant="contained" 
            disabled={!selectedFile}
          >
            Upload Evidence
          </Button>
        </DialogActions>
      </Dialog>

      {/* GitHub Commit Dialog */}
      <Dialog open={showCommitDialog} onClose={() => setShowCommitDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Select Commit Proof</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {commits.length > 0 ? (
              <Autocomplete
                options={commits}
                getOptionLabel={(option) => `[${option.sha.substring(0, 7)}] ${option.message}`}
                onChange={(event, newValue) => setSelectedCommit(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Recent Repository Commits" fullWidth />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.authorName} • {new Date(option.authoredAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            ) : (
              <Alert severity="warning">No recent commits found in the repository.</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowCommitDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCommitProof} 
            variant="contained" 
            disabled={!selectedCommit}
          >
            Add Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog 
        open={showImagePreview} 
        onClose={() => setShowImagePreview(false)}
        maxWidth="lg"
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setShowImagePreview(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={previewImageUrl.startsWith('http') ? previewImageUrl : `${API_URL}/${previewImageUrl}`}
            alt="Proof Preview"
            style={{ width: '100%', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default TaskView;