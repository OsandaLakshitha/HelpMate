import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Alert,
  Chip,
  Skeleton,
  Tooltip,
  Avatar,
  AvatarGroup,
  alpha,
  useTheme,
} from '@mui/material';
import SearchIcon       from '@mui/icons-material/Search';
import AddIcon          from '@mui/icons-material/Add';
import CodeIcon         from '@mui/icons-material/Code';
import DescriptionIcon  from '@mui/icons-material/Description';
import FolderIcon       from '@mui/icons-material/Folder';
import UnfoldMoreIcon   from '@mui/icons-material/UnfoldMore';
import KeyboardArrowUpIcon   from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import { API_URL }  from '../../../config/api';
import { useAuth }  from '../../../context/AuthContext';

// ─── STATUS CONFIG — driven by BProject enum: 'Open' | 'Closed' ──────────────
// "Overdue" is a derived UI state (Open + past dueDate), not a DB value.
const STATUS_CFG = {
  Open:    { label: 'Open',    color: '#2a6ef5', bg: '#eef3ff', border: '#2a6ef540' },
  Closed:  { label: 'Closed',  color: '#64748b', bg: '#f1f5f9', border: '#64748b40' },
  Overdue: { label: 'Overdue', color: '#dc2626', bg: '#fef2f2', border: '#dc262640' },
};

// ─── COMPLEXITY CONFIG — driven by BProject enum: 'Low' | 'Medium' | 'High' ──
const COMPLEXITY_CFG = {
  Low:    { color: '#16a34a', bg: '#f0fdf4', border: '#16a34a40' },
  Medium: { color: '#d97706', bg: '#fffbeb', border: '#d9770640' },
  High:   { color: '#dc2626', bg: '#fef2f2', border: '#dc262640' },
};

// ─── PROJECT TYPE ICON — driven by BProject enum: 'Coding' | 'Documentation' | 'Both' | 'Other' ──
const getTypeIcon = (type) => {
  switch (type) {
    case 'Coding':        return <CodeIcon sx={{ fontSize: 16 }} />;
    case 'Documentation': return <DescriptionIcon sx={{ fontSize: 16 }} />;
    default:              return <FolderIcon sx={{ fontSize: 16 }} />;
  }
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const isOverdue = (project) =>
  project.status !== 'Closed' &&
  project.dueDate &&
  new Date(project.dueDate) < new Date();

const resolveStatus = (project) =>
  isOverdue(project) ? 'Overdue' : (project.status || 'Open');

// ─── SORT ICON ────────────────────────────────────────────────────────────────
const SortIcon = ({ active, dir }) => {
  if (!active) return <UnfoldMoreIcon sx={{ fontSize: 14, opacity: 0.35 }} />;
  return dir === 1
    ? <KeyboardArrowUpIcon   sx={{ fontSize: 14, color: '#13a2a2' }} />
    : <KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#13a2a2' }} />;
};

// ─── COLUMN HEADER BUTTON ─────────────────────────────────────────────────────
const ColHeader = ({ label, sortKey: key, currentSort, currentDir, onSort, align = 'left' }) => (
  <Box
    component="button"
    onClick={() => key && onSort(key)}
    sx={{
      all: 'unset',
      display: 'flex',
      alignItems: 'center',
      gap: 0.4,
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      cursor: key ? 'pointer' : 'default',
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: currentSort === key ? '#13a2a2' : 'text.secondary',
      userSelect: 'none',
      transition: 'color 0.15s',
      '&:hover': key ? { color: '#13a2a2' } : {},
    }}
  >
    {label}
    {key && <SortIcon active={currentSort === key} dir={currentDir} />}
  </Box>
);

// ─── SKELETON ROW ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: '1fr 110px 100px 110px 110px 130px 36px',
    alignItems: 'center',
    gap: 2,
    px: 2.5,
    py: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Skeleton variant="circular" width={30} height={30} />
      <Skeleton width="55%" height={14} />
    </Box>
    <Skeleton width={64}  height={22} sx={{ borderRadius: 99 }} />
    <Skeleton width={72}  height={22} sx={{ borderRadius: 99 }} />
    <Skeleton width={80}  height={14} />
    <Skeleton width={80}  height={14} />
    <Skeleton width={90}  height={14} />
    <Skeleton width={20}  height={20} sx={{ borderRadius: 1 }} />
  </Box>
);

// ─── PROJECT ROW — all data from project object (DB) ─────────────────────────
const ProjectRow = ({ project, userId, onClick, index }) => {
  const [hovered, setHovered] = useState(false);
  const theme = useTheme();

  const statusKey  = resolveStatus(project);
  const stCfg      = STATUS_CFG[statusKey] || STATUS_CFG.Open;
  const cxKey      = project.complexity || 'Low';
  const cxCfg      = COMPLEXITY_CFG[cxKey] || COMPLEXITY_CFG.Low;
  const memberCount = project.memberIds?.length ?? 0;
  const myId       = String(userId);

  return (
    <Box
      onClick={() => onClick(project._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 110px 100px 110px 110px 130px 36px',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 0,
        height: 56,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderLeft: '3px solid',
        borderLeftColor: hovered ? stCfg.color : 'transparent',
        bgcolor: hovered ? alpha(theme.palette.background.paper, 1) : 'transparent',
        boxShadow: hovered ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        opacity: 0,
        animation: `rowFadeIn 0.3s ease ${index * 35}ms forwards`,
        '@keyframes rowFadeIn': {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to:   { opacity: 1, transform: 'translateY(0)'   },
        },
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      {/* ── Col 1: Type icon + Title ───────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Avatar
          sx={{
            width: 30, height: 30, flexShrink: 0,
            bgcolor: hovered ? '#13a2a210' : alpha(theme.palette.action.hover, 0.5),
            color: hovered ? '#13a2a2' : 'text.secondary',
            transition: 'all 0.15s',
          }}
        >
          {getTypeIcon(project.projectType)}
        </Avatar>
        <Typography
          noWrap
          sx={{
            fontSize: '0.875rem',
            fontWeight: hovered ? 600 : 500,
            color: hovered ? '#13a2a2' : 'text.primary',
            transition: 'color 0.15s, font-weight 0.15s',
            letterSpacing: '-0.01em',
          }}
        >
          {project.title}
        </Typography>
      </Box>

      {/* ── Col 2: Status chip ────────────────────────────────────────────── */}
      <Box>
        <Chip
          label={stCfg.label}
          size="small"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            height: 22,
            px: 0.5,
            bgcolor: stCfg.bg,
            color:   stCfg.color,
            border:  `1px solid ${stCfg.border}`,
            borderRadius: '99px',
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Box>

      {/* ── Col 3: Complexity chip ────────────────────────────────────────── */}
      <Box>
        <Chip
          label={cxKey}
          size="small"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            height: 22,
            px: 0.5,
            bgcolor: cxCfg.bg,
            color:   cxCfg.color,
            border:  `1px solid ${cxCfg.border}`,
            borderRadius: '99px',
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Box>

      {/* ── Col 4: Start date (from startDate or createdAt) ───────────────── */}
      <Typography
        noWrap
        sx={{ fontSize: '0.78rem', color: 'text.secondary', fontFamily: 'monospace' }}
      >
        {formatDate(project.startDate || project.createdAt)}
      </Typography>

      {/* ── Col 5: Due date ───────────────────────────────────────────────── */}
      <Typography
        noWrap
        sx={{
          fontSize: '0.78rem',
          fontFamily: 'monospace',
          color: isOverdue(project) ? '#dc2626' : 'text.secondary',
          fontWeight: isOverdue(project) ? 600 : 400,
        }}
      >
        {formatDate(project.dueDate)}
      </Typography>

      {/* ── Col 6: Member avatar stack ────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AvatarGroup
          max={4}
          sx={{
            '& .MuiAvatar-root': {
              width: 22, height: 22,
              fontSize: '0.65rem',
              fontWeight: 700,
              border: '2px solid white',
            },
          }}
        >
          {project.memberIds?.map((mId, idx) => {
            const isMe = String(mId) === myId;
            return (
              <Tooltip key={String(mId) || idx} title={isMe ? 'You' : 'Member'} placement="top">
                <Avatar
                  sx={{
                    bgcolor: isMe ? '#13a2a2' : `hsl(${(idx * 53) % 360}, 55%, 65%)`,
                    color: '#ffffff',
                    fontSize: '0.6rem',
                  }}
                >
                  {isMe ? 'Y' : String.fromCharCode(65 + (idx % 26))}
                </Avatar>
              </Tooltip>
            );
          })}
        </AvatarGroup>
        {memberCount > 0 && (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontFamily: 'monospace' }}>
            {memberCount}
          </Typography>
        )}
      </Box>

      {/* ── Col 7: Chevron ───────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ChevronRightIcon
          sx={{
            fontSize: 18,
            color: hovered ? '#13a2a2' : 'transparent',
            transition: 'color 0.15s',
          }}
        />
      </Box>
    </Box>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Bprojectlist = () => {
  const theme    = useTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────────
  const [projects,         setProjects]         = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [filter,           setFilter]           = useState('all');    // 'all' | 'mine' | 'assigned'
  const [sortBy,           setSortBy]           = useState('recent'); // 'recent' | 'name' | 'dueDate' | 'status' | 'complexity' | 'members'
  const [sortDir,          setSortDir]          = useState(1);        // 1 = asc, -1 = desc

  const userId = user?._id || user?.id;

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sortProjects = useCallback((list) => {
    const copy = [...list];
    const cxOrder = { Low: 1, Medium: 2, High: 3 };
    switch (sortBy) {
      case 'name':
        return copy.sort((a, b) => sortDir * a.title.localeCompare(b.title));
      case 'dueDate':
        return copy.sort((a, b) => sortDir * (new Date(a.dueDate || 0) - new Date(b.dueDate || 0)));
      case 'status':
        return copy.sort((a, b) => sortDir * resolveStatus(a).localeCompare(resolveStatus(b)));
      case 'complexity':
        return copy.sort((a, b) => sortDir * ((cxOrder[a.complexity] || 0) - (cxOrder[b.complexity] || 0)));
      case 'members':
        return copy.sort((a, b) => sortDir * ((a.memberIds?.length ?? 0) - (b.memberIds?.length ?? 0)));
      case 'recent':
      default:
        return copy.sort((a, b) => sortDir * (new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }, [sortBy, sortDir]);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  useEffect(() => {
    let list = [...projects];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.projectType?.toLowerCase().includes(q) ||
        p.complexity?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q)
      );
    }
    setFilteredProjects(sortProjects(list));
  }, [searchQuery, projects, sortProjects]);

  // ── Fetch from DB — mirrors original fetchProjects exactly ────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter === 'mine') params.mine = 'true';

      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      let fetched = response.data.projects || [];

      // 'assigned' — client-side filter: member but NOT creator
      if (filter === 'assigned') {
        fetched = fetched.filter((p) =>
          p.memberIds?.map(String).includes(String(userId)) &&
          String(p.creatorId) !== String(userId)
        );
      }

      setProjects(fetched);
      setFilteredProjects(fetched);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [filter, token, userId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFilterChange = (_, newFilter) => { if (newFilter !== null) setFilter(newFilter); };
  const handleProjectClick = (id)            => navigate(`/user/projects/${id}`);
  const handleCreateProject = ()             => navigate('/user/createproject');

  const handleSort = (key) => {
    if (sortBy === key) setSortDir((d) => d * -1);
    else { setSortBy(key); setSortDir(1); }
  };

  // ── Counts from live DB data ───────────────────────────────────────────────
  const counts = {
    all:      projects.length,
    open:     projects.filter((p) => p.status === 'Open' && !isOverdue(p)).length,
    overdue:  projects.filter((p) => isOverdue(p)).length,
    closed:   projects.filter((p) => p.status === 'Closed').length,
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            letterSpacing="-0.02em"
            gutterBottom
          >
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all your projects in one place
          </Typography>
        </Box>

        {/* Live status summary pills — from DB data */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', pt: 0.5 }}>
          {counts.open > 0 && (
            <Chip
              label={`${counts.open} Open`}
              size="small"
              sx={{ bgcolor: '#eef3ff', color: '#2a6ef5', border: '1px solid #2a6ef530', fontWeight: 600, fontSize: '0.72rem' }}
            />
          )}
          {counts.overdue > 0 && (
            <Chip
              label={`${counts.overdue} Overdue`}
              size="small"
              sx={{ bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #dc262630', fontWeight: 600, fontSize: '0.72rem' }}
            />
          )}
          {counts.closed > 0 && (
            <Chip
              label={`${counts.closed} Closed`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#64748b', border: '1px solid #64748b30', fontWeight: 600, fontSize: '0.72rem' }}
            />
          )}

          {/* New Project button — same handler as original */}
          <Tooltip title="Create New Project">
            <IconButton
              onClick={handleCreateProject}
              sx={{
                bgcolor: '#13a2a2',
                color: '#fff',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                ml: 1,
                fontSize: '0.82rem',
                fontWeight: 600,
                gap: 0.5,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: '#035757' },
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              New Project
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── ERROR BANNER ────────────────────────────────────────────────────── */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <IconButton size="small" color="inherit" onClick={fetchProjects}>
              Retry
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* ── TOOLBAR: Search + Filter tabs ────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center',
          gap: 2, mb: 2, flexWrap: 'wrap',
          p: 1.5, borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Search — only control kept from original toolbar */}
        <TextField
          placeholder="Search projects…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: 280 }}
          InputProps={{
            sx: { borderRadius: 2.5, bgcolor: 'background.paper', fontSize: '0.85rem' },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                  ×
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Filter tabs — All / My Projects / Assigned */}
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2, py: 0.5,
              fontSize: '0.78rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px !important',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: '#13a2a2',
                color: '#fff',
                borderColor: '#13a2a2',
                '&:hover': { bgcolor: '#0e8a8a' },
              },
            },
          }}
        >
          <ToggleButton value="all">
            All
            {counts.all > 0 && (
              <Box component="span" sx={{ ml: 0.8, fontSize: '0.68rem', opacity: 0.75 }}>
                {counts.all}
              </Box>
            )}
          </ToggleButton>
          <ToggleButton value="mine">My Projects</ToggleButton>
          <ToggleButton value="assigned">Assigned</ToggleButton>
        </ToggleButtonGroup>

        {/* Result count — right-aligned */}
        <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto', fontFamily: 'monospace' }}>
          {loading
            ? 'Loading…'
            : `${filteredProjects.length} of ${projects.length} projects`}
        </Typography>
      </Box>

      {/* ── TABLE CONTAINER ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* ── COLUMN HEADERS ──────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px 100px 110px 110px 130px 36px',
            alignItems: 'center',
            gap: 2,
            px: 2.5,
            height: 40,
            bgcolor: '#13a2a267',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <ColHeader label="Project"    sortKey="name"       currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
          <ColHeader label="Status"     sortKey="status"     currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
          <ColHeader label="Complexity" sortKey="complexity" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
          <ColHeader label="Start"      sortKey={null}       currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
          <ColHeader label="Due"        sortKey="dueDate"    currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
          <ColHeader label="Team"       sortKey="members"    currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
          <Box />
        </Box>

        {/* ── LOADING SKELETONS ────────────────────────────────────────────── */}
        {loading && [0, 1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

        {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
        {!loading && filteredProjects.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10, px: 3 }}>
            <Box
              sx={{
                width: 72, height: 72, borderRadius: '50%',
                bgcolor: alpha(theme.palette.action.hover, 0.5),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}
            >
              <SearchIcon sx={{ fontSize: 34, color: 'text.disabled' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No matching projects found' : 'No projects here yet'}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 440, mx: 'auto' }}>
              {searchQuery
                ? "Try adjusting your search to find what you're looking for."
                : filter === 'mine'
                ? 'Get started by creating your first project.'
                : 'No projects available. Check back later or create a new one.'}
            </Typography>
            {!searchQuery && (filter === 'all' || filter === 'mine') && (
              <IconButton
                onClick={handleCreateProject}
                sx={{
                  bgcolor: '#13a2a2', color: '#fff',
                  borderRadius: 2, px: 2.5, py: 0.8,
                  fontSize: '0.82rem', fontWeight: 600, gap: 0.5,
                  '&:hover': { bgcolor: '#035757' },
                }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
                Create New Project
              </IconButton>
            )}
          </Box>
        )}

        {/* ── PROJECT ROWS — 100% from DB data, zero hardcoding ────────────── */}
        {!loading && filteredProjects.map((project, index) => (
          <ProjectRow
            key={project._id}
            project={project}
            index={index}
            userId={userId}
            onClick={handleProjectClick}
          />
        ))}

        {/* ── TABLE FOOTER ─────────────────────────────────────────────────── */}
        {!loading && filteredProjects.length > 0 && (
          <Box
            sx={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', px: 2.5, py: 1.2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: '#13a2a267',
            }}
          >
            <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
              Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` · ${filter}`}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
              {counts.open} open · {counts.overdue} overdue · {counts.closed} closed
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Bprojectlist;