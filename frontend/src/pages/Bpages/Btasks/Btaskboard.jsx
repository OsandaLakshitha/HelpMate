import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Box, Typography, Paper, Chip, Button, CircularProgress,
  Alert, IconButton, Collapse, LinearProgress,
  Menu, MenuItem, Select, FormControl,
} from '@mui/material';
import ArrowBackIcon            from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon           from '@mui/icons-material/ExpandMore';
import ExpandLessIcon           from '@mui/icons-material/ExpandLess';
import CheckCircleIcon          from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon           from '@mui/icons-material/AccessTime';
import YouTubeIcon              from '@mui/icons-material/YouTube';
import AutoAwesomeIcon          from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon           from '@mui/icons-material/TrendingUp';
import TrendingDownIcon         from '@mui/icons-material/TrendingDown';
import KeyboardArrowDownIcon    from '@mui/icons-material/KeyboardArrowDown';
import FolderOpenIcon           from '@mui/icons-material/FolderOpen';
import TaskAltIcon              from '@mui/icons-material/TaskAlt';
import PendingActionsIcon       from '@mui/icons-material/PendingActions';
import SpeedIcon                from '@mui/icons-material/Speed';
import LockIcon                 from '@mui/icons-material/Lock';
import TuneIcon                 from '@mui/icons-material/Tune';
import WarningAmberIcon         from '@mui/icons-material/WarningAmber';

const C = {
  bg:'#F0F2FA', surface:'#FFFFFF', border:'#E4E7EF',
  primary:'#4361EE', primarySoft:'#EEF1FD',
  text:'#1A1D2E', muted:'#6B7280',
  success:'#16A34A', successSoft:'#DCFCE7',
  warning:'#D97706', warningSoft:'#FEF3C7',
  error:'#DC2626', errorSoft:'#FEE2E2',
  newCol:'#F5F7FF', doneCol:'#F0FDF4',
};
const CX = {
  1:{label:'Very Easy',color:'#16A34A',bg:'#DCFCE7'},
  2:{label:'Easy',color:'#2563EB',bg:'#DBEAFE'},
  3:{label:'Medium',color:'#D97706',bg:'#FEF3C7'},
  4:{label:'Hard',color:'#DC2626',bg:'#FEE2E2'},
  5:{label:'Very Hard',color:'#7C3AED',bg:'#EDE9FE'},
};
const PM = {
  'on-track':   {label:'On Track',  color:'#16A34A',bg:'#DCFCE7',icon:'✅'},
  'at-risk':    {label:'At Risk',   color:'#D97706',bg:'#FEF3C7',icon:'⚠️'},
  'in-danger':  {label:'In Danger', color:'#DC2626',bg:'#FEE2E2',icon:'🚨'},
  'not-started':{label:'Not Started',color:'#6B7280',bg:'#F3F4F6',icon:'⏳'},
  'complete':   {label:'Complete',  color:'#7C3AED',bg:'#EDE9FE',icon:'🎉'},
};

// ── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onComplete, index }) => {
  const [open, setOpen]             = useState(false);
  const [completing, setCompleting] = useState(false);
  const cx          = CX[task.complexity] || CX[3];
  const isCompleted = task.status === 'Completed';
  const daysLeft    = task.dueDate ? Math.ceil((new Date(task.dueDate) - new Date()) / 86400000) : null;
  const dueDateColor = isCompleted ? C.muted : daysLeft === null ? C.muted
    : daysLeft < 0 ? C.error : daysLeft < 3 ? C.error : daysLeft < 7 ? C.warning : C.muted;

  const handleComplete = async () => { setCompleting(true); await onComplete(task._id); setCompleting(false); };

  return (
    <Paper elevation={0} sx={{
      borderRadius:2.5, border:`1px solid ${isCompleted?'#BBF7D0':C.border}`,
      bgcolor:C.surface, overflow:'hidden', transition:'all 0.2s ease', opacity:isCompleted?0.85:1,
      animation:`slideIn 0.3s cubic-bezier(0.16,1,0.3,1) ${index*0.05}s both`,
      '@keyframes slideIn':{from:{opacity:0,transform:'translateY(8px)'},to:{opacity:1,transform:'translateY(0)'}},
      '&:hover':{boxShadow:isCompleted?'none':'0 4px 16px rgba(67,97,238,0.1)',
        borderColor:isCompleted?'#BBF7D0':`${C.primary}50`,transform:isCompleted?'none':'translateY(-1px)'},
    }}>
      <Box sx={{height:3,bgcolor:isCompleted?C.success:cx.color,opacity:0.6}}/>
      <Box sx={{p:2}}>
        <Box sx={{display:'flex',gap:1.2,alignItems:'flex-start'}}>
          <Box onClick={!isCompleted&&!completing?handleComplete:undefined} sx={{
            mt:0.15,flexShrink:0,cursor:isCompleted?'default':'pointer',
            color:isCompleted?C.success:'#D1D5DB',transition:'all 0.15s',
            '&:hover':!isCompleted?{color:C.success,transform:'scale(1.2)'}:{},
          }}>
            {completing?<CircularProgress size={19} sx={{color:C.success}}/>
              :isCompleted?<CheckCircleIcon sx={{fontSize:20}}/>:<RadioButtonUncheckedIcon sx={{fontSize:20}}/>}
          </Box>
          <Box sx={{flex:1,minWidth:0}}>
            <Box sx={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:0.8,mb:0.5}}>
              <Typography fontWeight={600} fontSize={13} color={isCompleted?C.muted:C.text}
                sx={{textDecoration:isCompleted?'line-through':'none',lineHeight:1.4}}>
                {task.name||task.title}
              </Typography>
              <Chip label={cx.label} size="small"
                sx={{bgcolor:cx.bg,color:cx.color,fontWeight:700,fontSize:9.5,height:18,flexShrink:0,px:0.3}}/>
            </Box>
            <Typography fontSize={12} color={C.muted} lineHeight={1.55} mb={1.2}>{task.description}</Typography>
            <Box sx={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <Box sx={{display:'flex',alignItems:'center',gap:1.5}}>
                {task.dueDate&&(
                  <Box sx={{display:'flex',alignItems:'center',gap:0.4}}>
                    <AccessTimeIcon sx={{fontSize:11,color:dueDateColor}}/>
                    <Typography fontSize={11} color={dueDateColor}
                      fontWeight={daysLeft!==null&&daysLeft<3&&!isCompleted?700:400}>
                      {new Date(task.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                      {!isCompleted&&daysLeft!==null&&(
                        <Box component="span" ml={0.4} fontWeight={700}>
                          {daysLeft>0?`· ${daysLeft}d`:daysLeft===0?'· Today':`· ${Math.abs(daysLeft)}d late`}
                        </Box>
                      )}
                      {isCompleted&&task.completedAt&&(
                        <Box component="span" ml={0.4} color={C.success}>
                          · Done {new Date(task.completedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </Box>
                      )}
                    </Typography>
                  </Box>
                )}
                {task.estimatedHours&&<Typography fontSize={11} color={C.muted}>~{task.estimatedHours}h</Typography>}
              </Box>
              <IconButton size="small" onClick={()=>setOpen(p=>!p)}
                sx={{width:24,height:24,border:`1px solid ${C.border}`,bgcolor:C.bg,'&:hover':{borderColor:C.primary}}}>
                {open?<ExpandLessIcon sx={{fontSize:13}}/>:<ExpandMoreIcon sx={{fontSize:13}}/>}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{mx:2,mb:2,borderRadius:2,bgcolor:'#F8F9FE',border:`1px solid ${C.border}`,overflow:'hidden'}}>
          {task.steps?.length>0&&(
            <Box sx={{p:1.8,borderBottom:task.youtubeQueries?.length?`1px solid ${C.border}`:'none'}}>
              <Typography fontSize={10} fontWeight={700} color={C.primary} textTransform="uppercase" letterSpacing={0.8} mb={1.2}>Steps</Typography>
              {task.steps.map((step,i)=>(
                <Box key={i} sx={{display:'flex',gap:1.2,mb:0.8}}>
                  <Box sx={{width:18,height:18,borderRadius:'50%',flexShrink:0,bgcolor:C.primarySoft,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Typography fontSize={8} fontWeight={800} color={C.primary}>{i+1}</Typography>
                  </Box>
                  <Typography fontSize={12} color={C.text} lineHeight={1.55} pt={0.1}>{step}</Typography>
                </Box>
              ))}
            </Box>
          )}
          {task.youtubeQueries?.length>0&&(
            <Box sx={{p:1.8}}>
              <Typography fontSize={10} fontWeight={700} color={C.error} textTransform="uppercase" letterSpacing={0.8} mb={1}>Resources</Typography>
              <Box sx={{display:'flex',flexWrap:'wrap',gap:0.7}}>
                {task.youtubeQueries.map((q,i)=>(
                  <Box key={i} component="a"
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                    target="_blank" rel="noopener noreferrer"
                    sx={{display:'flex',alignItems:'center',gap:0.5,px:1,py:0.5,borderRadius:1.5,
                      bgcolor:'#FFF0F0',border:'1px solid #FECACA',textDecoration:'none','&:hover':{bgcolor:'#FFE4E4'}}}>
                    <YouTubeIcon sx={{fontSize:12,color:'#DC2626'}}/>
                    <Typography fontSize={11} color={C.text}>{q}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// ── Prediction Strip ──────────────────────────────────────────────────────────
const PredictionStrip = ({ prediction }) => {
  if (
    !prediction ||
    prediction.coldStart === true ||
    prediction.status === 'not-started' ||
    (prediction.dataPointsUsed !== undefined && prediction.dataPointsUsed < 4)
  ) {
    const done     = prediction?.dataPointsUsed    ?? 0;
    const needed   = prediction?.completionsNeeded ?? Math.max(0, 4 - done);
    const pct      = Math.min(100, (done / 4) * 100);
    const daysLeft = prediction?.daysLeft ?? null;
    return (
      <Paper elevation={0} sx={{border:`1.5px solid ${C.border}`,borderRadius:3,mb:3,overflow:'hidden'}}>
        <Box sx={{display:'flex',alignItems:'stretch',flexWrap:'wrap',bgcolor:'#F8F9FE'}}>
          <Box sx={{px:2.5,py:2,borderRight:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:1.2,minWidth:160}}>
            <Box sx={{width:36,height:36,borderRadius:2,bgcolor:C.primarySoft,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <LockIcon sx={{fontSize:18,color:C.primary}}/>
            </Box>
            <Box>
              <Typography fontSize={10} fontWeight={700} color={C.primary} textTransform="uppercase" letterSpacing={0.6}>Prediction</Typography>
              <Typography fontSize={13} fontWeight={800} color={C.text}>Locked</Typography>
            </Box>
          </Box>
          <Box sx={{flex:1,px:2.5,py:2,borderRight:`1px solid ${C.border}`,minWidth:200}}>
            <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:0.8}}>
              <Typography fontSize={12} color={C.muted}>
                Complete <strong style={{color:C.primary}}>{needed} more task{needed!==1?'s':''}</strong> to unlock
              </Typography>
              <Chip label={`${done} / 4`} size="small" sx={{bgcolor:C.primarySoft,color:C.primary,fontWeight:700,fontSize:11}}/>
            </Box>
            <LinearProgress variant="determinate" value={pct}
              sx={{height:8,borderRadius:4,bgcolor:C.border,'& .MuiLinearProgress-bar':{bgcolor:C.primary,borderRadius:4}}}/>
            <Typography fontSize={10.5} color={C.muted} mt={0.6}>
              {done} task{done!==1?'s':''} completed across all projects
            </Typography>
          </Box>
          {daysLeft!==null&&(
            <Box sx={{px:2.5,py:2}}>
              <Typography fontSize={10} color={C.muted} fontWeight={600} mb={0.3}>Days Left</Typography>
              <Typography fontSize={22} fontWeight={800} lineHeight={1}
                color={daysLeft<7?C.error:daysLeft<14?C.warning:C.text}>
                {daysLeft}<Box component="span" fontSize={12} fontWeight={400} color={C.muted}> d</Box>
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{px:2.5,py:1.2,bgcolor:C.primarySoft,borderTop:`1px solid ${C.border}`}}>
          <Typography fontSize={11.5} color={C.primary}>
            💡 Needs at least <strong>4 task completions</strong> across any project to predict your performance.
          </Typography>
        </Box>
      </Paper>
    );
  }

  const ps = PM[prediction.status] || PM['not-started'];
  return (
    <Paper elevation={0} sx={{border:`1.5px solid ${ps.color}25`,borderRadius:3,mb:3,overflow:'hidden'}}>
      <Box sx={{display:'flex',alignItems:'stretch',flexWrap:'wrap',bgcolor:ps.bg}}>
        <Box sx={{px:2.5,py:2,borderRight:`1px solid ${ps.color}20`,minWidth:140}}>
          <Box sx={{display:'flex',alignItems:'center',gap:0.8,mb:0.3}}>
            <SpeedIcon sx={{fontSize:14,color:ps.color}}/>
            <Typography fontSize={10} fontWeight={700} color={ps.color} textTransform="uppercase" letterSpacing={0.6}>Prediction</Typography>
          </Box>
          <Typography fontSize={16} fontWeight={800} color={ps.color}>{ps.icon} {ps.label}</Typography>
          {prediction.priority&&(
            <Chip label={prediction.priority.toUpperCase()} size="small" sx={{
              mt:0.5,height:16,fontSize:9,fontWeight:700,
              bgcolor:prediction.priority==='high'?'#FEE2E2':prediction.priority==='low'?'#F3F4F6':'#DBEAFE',
              color:prediction.priority==='high'?C.error:prediction.priority==='low'?C.muted:'#2563EB',
            }}/>
          )}
        </Box>
        <Box sx={{px:2.5,py:2,borderRight:`1px solid ${ps.color}20`}}>
          <Typography fontSize={10} color={C.muted} fontWeight={600} mb={0.3}>Score</Typography>
          <Typography fontSize={22} fontWeight={800} color={ps.color} lineHeight={1}>
            {prediction.completionScore?.toFixed(0)??'—'}
            <Box component="span" fontSize={12} fontWeight={400} color={C.muted}>/100</Box>
          </Typography>
        </Box>
        <Box sx={{px:2.5,py:2,borderRight:`1px solid ${ps.color}20`}}>
          <Typography fontSize={10} color={C.muted} fontWeight={600} mb={0.3}>Days Left</Typography>
          <Typography fontSize={22} fontWeight={800} color={C.text} lineHeight={1}>
            {prediction.daysLeft??'—'}<Box component="span" fontSize={12} fontWeight={400} color={C.muted}> d</Box>
          </Typography>
        </Box>
        <Box sx={{px:2.5,py:2,borderRight:`1px solid ${ps.color}20`}}>
          <Typography fontSize={10} color={C.muted} fontWeight={600} mb={0.3}>Pace</Typography>
          <Box sx={{display:'flex',alignItems:'center',gap:0.4}}>
            {(prediction.paceDelta??0)>=0
              ?<TrendingUpIcon sx={{color:C.success,fontSize:16}}/>
              :<TrendingDownIcon sx={{color:C.error,fontSize:16}}/>}
            <Typography fontSize={18} fontWeight={800} color={(prediction.paceDelta??0)>=0?C.success:C.error}>
              {(prediction.paceDelta??0)>=0?'+':''}{prediction.paceDelta?.toFixed(1)??'0'}%
            </Typography>
          </Box>
        </Box>
        <Box sx={{px:2.5,py:2,borderRight:`1px solid ${ps.color}20`}}>
          <Typography fontSize={10} color={C.muted} fontWeight={600} mb={0.3}>Daily Hours</Typography>
          <Typography fontSize={18} fontWeight={800} color={C.text} lineHeight={1}>
            {prediction.dailyHoursAllocated??'—'}
            <Box component="span" fontSize={11} fontWeight={400} color={C.muted}>h</Box>
          </Typography>
        </Box>
        <Box sx={{flex:1,px:2.5,py:2,minWidth:130}}>
          <Box sx={{display:'flex',justifyContent:'space-between',mb:0.5}}>
            <Typography fontSize={10} color={C.muted} fontWeight={600}>Confidence</Typography>
            <Typography fontSize={10} fontWeight={700} color={C.text}>
              {prediction.confidence!==undefined?`${(prediction.confidence*100).toFixed(0)}%`:'—'}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={(prediction.confidence??0)*100}
            sx={{height:5,borderRadius:3,bgcolor:`${ps.color}20`,'& .MuiLinearProgress-bar':{bgcolor:ps.color,borderRadius:3}}}/>
          {(prediction.confidence??0)<0.4&&(
            <Typography fontSize={9.5} color={C.muted} mt={0.4}>Complete more tasks to improve</Typography>
          )}
        </Box>
      </Box>
      {prediction.linearConflictWarning&&(
        <Box sx={{px:2.5,py:1.2,bgcolor:C.warningSoft,borderTop:`1px solid ${C.warning}20`,display:'flex',alignItems:'center',gap:1}}>
          <WarningAmberIcon sx={{fontSize:15,color:C.warning}}/>
          <Typography fontSize={11.5} color={C.warning}>{prediction.linearConflictWarning}</Typography>
        </Box>
      )}
      {prediction.status==='in-danger'&&(
        <Box sx={{px:2.5,py:1.5,bgcolor:'#FEF2F2',borderTop:`1px solid ${ps.color}20`}}>
          <Typography fontSize={12} color={ps.color} fontWeight={600}>
            🚨 At your current pace, finishing before the deadline is very difficult. Raise this project's priority or increase daily hours.
          </Typography>
        </Box>
      )}
      {prediction.status==='at-risk'&&(
        <Box sx={{px:2.5,py:1.5,bgcolor:'#FFFBEB',borderTop:`1px solid ${ps.color}20`}}>
          <Typography fontSize={12} color={ps.color} fontWeight={600}>
            ⚠️ Falling behind. Complete tasks faster or set this project to High priority.
          </Typography>
        </Box>
      )}
      {prediction.status==='on-track'&&(
        <Box sx={{px:2.5,py:1.5,bgcolor:'#F0FDF4',borderTop:`1px solid ${C.success}20`}}>
          <Typography fontSize={12} color={C.success} fontWeight={600}>✅ Great work! You are on track to finish on time.</Typography>
        </Box>
      )}
      {prediction.status==='complete'&&(
        <Box sx={{px:2.5,py:1.5,bgcolor:'#F5F3FF',borderTop:`1px solid #7C3AED20`}}>
          <Typography fontSize={12} color="#7C3AED" fontWeight={600}>🎉 All tasks completed!</Typography>
        </Box>
      )}
    </Paper>
  );
};

// ── Priority Settings Panel ───────────────────────────────────────────────────
const PriorityPanel = ({ projectId, currentPriority, currentMode, headers, onSaved }) => {
  const [priority,       setPriority]       = useState(currentPriority || 'medium');
  const [schedulingMode, setSchedulingMode] = useState(currentMode     || 'parallel');
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/members/${projectId}/priority`,
        { priority, schedulingMode },
        { headers }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (err) { console.error('Priority save error:', err); }
    finally { setSaving(false); }
  };

  const changed = priority !== currentPriority || schedulingMode !== currentMode;

  return (
    <Paper elevation={0} sx={{border:`1px solid ${C.border}`,borderRadius:2.5,p:2,mb:3,bgcolor:C.surface}}>
      <Box sx={{display:'flex',alignItems:'center',gap:1,mb:1.5}}>
        <TuneIcon sx={{fontSize:16,color:C.primary}}/>
        <Typography fontSize={13} fontWeight={700} color={C.text}>Project Scheduling</Typography>
        <Typography fontSize={11} color={C.muted} ml={0.5}>— controls daily hour allocation</Typography>
      </Box>
      <Box sx={{display:'flex',alignItems:'center',gap:2,flexWrap:'wrap'}}>
        <Box>
          <Typography fontSize={10} fontWeight={600} color={C.muted} mb={0.5} textTransform="uppercase" letterSpacing={0.6}>Priority</Typography>
          <FormControl size="small">
            <Select value={priority} onChange={e=>setPriority(e.target.value)}
              sx={{fontSize:13,fontWeight:600,borderRadius:2,minWidth:130,
                bgcolor:priority==='high'?'#FEE2E2':priority==='low'?'#F3F4F6':'#DBEAFE'}}>
              <MenuItem value="high"><Box sx={{display:'flex',alignItems:'center',gap:1}}><Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:C.error}}/>High (1.5×)</Box></MenuItem>
              <MenuItem value="medium"><Box sx={{display:'flex',alignItems:'center',gap:1}}><Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:'#2563EB'}}/>Medium (1.0×)</Box></MenuItem>
              <MenuItem value="low"><Box sx={{display:'flex',alignItems:'center',gap:1}}><Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:C.muted}}/>Low (0.6×)</Box></MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography fontSize={10} fontWeight={600} color={C.muted} mb={0.5} textTransform="uppercase" letterSpacing={0.6}>Mode</Typography>
          <FormControl size="small">
            <Select value={schedulingMode} onChange={e=>setSchedulingMode(e.target.value)}
              sx={{fontSize:13,fontWeight:600,borderRadius:2,minWidth:160}}>
              <MenuItem value="parallel">⚖️ Parallel (daily split)</MenuItem>
              <MenuItem value="linear">📌 Linear (finish first)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{flex:1,minWidth:180}}>
          <Typography fontSize={11} color={C.muted}>
            {schedulingMode==='linear'
              ? '📌 Finish this project before others. Earlier deadlines are still protected automatically.'
              : '⚖️ Work on all projects daily. Hours split by priority × deadline urgency.'}
          </Typography>
        </Box>
        {changed&&(
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving}
            sx={{fontWeight:700,borderRadius:2,bgcolor:C.primary,fontSize:12,boxShadow:'none','&:hover':{bgcolor:'#3451d1',boxShadow:'none'}}}>
            {saving?'Saving...':saved?'✅ Saved':'Save & Rebalance'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

// ── Column ────────────────────────────────────────────────────────────────────
const Column = ({ icon, title, count, accentColor, accentBg, borderColor, children }) => (
  <Paper elevation={0} sx={{border:`1px solid ${borderColor}`,borderRadius:3,overflow:'hidden'}}>
    <Box sx={{display:'flex',alignItems:'center',gap:1.5,px:2.5,py:2,bgcolor:accentBg,borderBottom:`2px solid ${accentColor}25`}}>
      <Box sx={{color:accentColor}}>{icon}</Box>
      <Typography fontWeight={700} fontSize={14} color={accentColor}>{title}</Typography>
      <Box sx={{ml:'auto',minWidth:24,height:24,borderRadius:5,px:1,bgcolor:accentColor,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Typography fontSize={11} fontWeight={800} color="#fff">{count}</Typography>
      </Box>
    </Box>
    <Box sx={{p:2,display:'flex',flexDirection:'column',gap:1.5,minHeight:240}}>{children}</Box>
  </Paper>
);

// ═════════════════════════════════════════════════════════════════════════════
const Taskboard = () => {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const [projects,      setProjects]      = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [anchorEl,      setAnchorEl]      = useState(null);
  const [tasks,         setTasks]         = useState([]);
  const [prediction,    setPrediction]    = useState(null);
  const [memberRecord,  setMemberRecord]  = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [rebalancing,   setRebalancing]   = useState(false);
  const [error,         setError]         = useState('');

  const headers       = { Authorization: `Bearer ${token}` };
  const currentUserId = user?._id || user?.id;

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const res  = await axios.get(`${API_URL}/api/projects`, { headers });
      const list = res.data.projects || [];
      setProjects(list);
      const target = id ? list.find(p => p._id === id) || list[0] : list[0];
      if (target) { setActiveProject(target); await loadTasks(target._id); }
      else setLoading(false);
    } catch { setError('Failed to load projects'); setLoading(false); }
  };

  const loadTasks = async (projectId) => {
    setLoading(true); setError('');
    try {
      const taskRes = await axios.get(`${API_URL}/api/tasks`, { headers, params: { projectId } });
      const myTasks = (taskRes.data.tasks || []).filter(t =>
        String(t.assigneeId?._id || t.assigneeId) === String(currentUserId)
      );
      setTasks(myTasks);

      try {
        const predRes = await axios.get(`${API_URL}/api/prediction/${projectId}`, { headers });
        setPrediction(predRes.data.prediction || null);
      } catch { setPrediction(null); }

      try {
        const memRes = await axios.get(`${API_URL}/api/members/${projectId}/members`, { headers });
        const me = (memRes.data.members || []).find(m =>
          String(m.userId?._id || m.userId) === String(currentUserId)
        );
        setMemberRecord(me || null);
      } catch { setMemberRecord(null); }

    } catch { setError('Failed to load tasks'); }
    finally  { setLoading(false); }
  };

  const handleSwitchProject = async (project) => {
    setActiveProject(project); setAnchorEl(null);
    await loadTasks(project._id);
  };

  const handleComplete = async (taskId) => {
    try {
      await axios.put(`${API_URL}/api/tasks/${taskId}/complete`, {}, { headers });
      setTasks(prev => prev.map(t =>
        t._id === taskId ? { ...t, status: 'Completed', completedAt: new Date().toISOString() } : t
      ));
      try {
        const predRes = await axios.get(`${API_URL}/api/prediction/${activeProject._id}`, { headers });
        setPrediction(predRes.data.prediction || null);
      } catch { /* ok */ }
    } catch { setError('Failed to mark task complete'); }
  };

  const handleRebalance = async () => {
    setRebalancing(true);
    try {
      await axios.post(`${API_URL}/api/tasks/rebalance/${activeProject._id}`, {}, { headers });
      await loadTasks(activeProject._id);
    } catch { setError('Failed to rebalance tasks'); }
    finally { setRebalancing(false); }
  };

  const newTasks       = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const progressPct    = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <Box sx={{ bgcolor: C.bg, minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 1040, mx: 'auto', px: 3 }}>

        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:3.5, flexWrap:'wrap', gap:2 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            <IconButton size="small" onClick={() => navigate(-1)}
              sx={{ border:`1px solid ${C.border}`, bgcolor:C.surface, '&:hover':{ borderColor:C.primary } }}>
              <ArrowBackIcon fontSize="small"/>
            </IconButton>
            <Box>
              <Typography fontWeight={800} fontSize={20} color={C.text} sx={{ letterSpacing:'-0.3px' }}>My Task Board</Typography>
              <Typography fontSize={12} color={C.muted}>Private — only visible to you</Typography>
            </Box>
          </Box>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            <Button variant="outlined"
              startIcon={<FolderOpenIcon sx={{ fontSize:16 }}/>}
              endIcon={<KeyboardArrowDownIcon/>}
              onClick={e => setAnchorEl(e.currentTarget)}
              sx={{ borderColor:C.border, color:C.text, fontWeight:600, borderRadius:2.5, px:2, py:0.9,
                fontSize:13, bgcolor:C.surface, textTransform:'none', '&:hover':{ borderColor:C.primary, bgcolor:C.primarySoft } }}>
              {activeProject?.title ? (activeProject.title.length > 24 ? activeProject.title.slice(0,24)+'...' : activeProject.title) : 'Select Project'}
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx:{ borderRadius:2.5, border:`1px solid ${C.border}`, boxShadow:'0 8px 30px rgba(0,0,0,0.1)', minWidth:260, mt:1 } }}>
              <Box sx={{ px:2, py:1.2, borderBottom:`1px solid ${C.border}` }}>
                <Typography fontSize={11} fontWeight={700} color={C.muted} textTransform="uppercase" letterSpacing={0.8}>Switch Project</Typography>
              </Box>
              {projects.length === 0
                ? <MenuItem disabled><Typography fontSize={13} color={C.muted}>No projects found</Typography></MenuItem>
                : projects.map(p => (
                  <MenuItem key={p._id} onClick={() => handleSwitchProject(p)} selected={activeProject?._id === p._id}
                    sx={{ px:2, py:1.5, gap:1.5, '&.Mui-selected':{ bgcolor:C.primarySoft }, '&:hover':{ bgcolor:C.primarySoft } }}>
                    <Box sx={{ width:8, height:8, borderRadius:'50%', flexShrink:0, bgcolor:p.status==='Open'?C.success:C.muted }}/>
                    <Box sx={{ flex:1, minWidth:0 }}>
                      <Typography fontSize={13} fontWeight={600} color={C.text}
                        sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</Typography>
                      <Typography fontSize={10.5} color={C.muted}>{p.status}</Typography>
                    </Box>
                    {activeProject?._id === p._id && <CheckCircleIcon sx={{ fontSize:15, color:C.primary, flexShrink:0 }}/>}
                  </MenuItem>
                ))}
            </Menu>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb:3, borderRadius:2 }} onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', pt:10 }}><CircularProgress/></Box>
        ) : !activeProject ? (
          <Paper elevation={0} sx={{ border:`1px solid ${C.border}`, borderRadius:3, p:6, textAlign:'center' }}>
            <FolderOpenIcon sx={{ fontSize:48, color:C.border, mb:2 }}/>
            <Typography fontWeight={700} fontSize={16} color={C.text} mb={1}>No projects yet</Typography>
            <Typography fontSize={13} color={C.muted} mb={3}>Create a project to get started</Typography>
            <Button variant="contained" onClick={() => navigate('/user/createproject')}
              sx={{ fontWeight:700, borderRadius:2, bgcolor:C.primary }}>Create Project</Button>
          </Paper>
        ) : (
          <>
            <PredictionStrip prediction={prediction} />

            {/* ── Priority Panel — NEW ── */}
            {tasks.length > 0 && (
              <PriorityPanel
                projectId={activeProject._id}
                currentPriority={memberRecord?.priority       || 'medium'}
                currentMode={memberRecord?.schedulingMode     || 'parallel'}
                headers={headers}
                onSaved={() => loadTasks(activeProject._id)}
              />
            )}

            {tasks.length > 0 && (
              <Paper elevation={0} sx={{ border:`1px solid ${C.border}`, borderRadius:2.5, p:2.5, mb:3 }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
                  <Typography fontSize={13} fontWeight={600} color={C.text}>{activeProject.title}</Typography>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                    <Typography fontSize={12} color={C.muted}>{completedTasks.length}/{tasks.length}</Typography>
                    <Typography fontSize={13} fontWeight={700}
                      color={progressPct===100?C.success:C.primary}>{progressPct.toFixed(0)}%</Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={progressPct}
                  sx={{ height:8, borderRadius:4, bgcolor:C.border,
                    '& .MuiLinearProgress-bar':{ bgcolor:progressPct===100?C.success:C.primary,
                      borderRadius:4, transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' } }}/>
                {progressPct===100 && <Typography fontSize={12} color={C.success} fontWeight={700} mt={1}>🎉 All tasks completed!</Typography>}
              </Paper>
            )}

            {tasks.length === 0 ? (
              <Paper elevation={0} sx={{ border:`1px solid ${C.border}`, borderRadius:3, p:6, textAlign:'center' }}>
                <AutoAwesomeIcon sx={{ fontSize:44, color:C.border, mb:2 }}/>
                <Typography fontWeight={700} fontSize={16} color={C.text} mb={1}>No tasks generated yet</Typography>
                <Typography fontSize={13} color={C.muted} mb={3}>Generate AI tasks for your component</Typography>
                <Button variant="contained" startIcon={<AutoAwesomeIcon/>}
                  onClick={() => navigate(`/user/generate-tasks/${activeProject._id}`)}
                  sx={{ fontWeight:700, borderRadius:2, bgcolor:C.primary,
                    boxShadow:`0 4px 14px ${C.primary}40`, '&:hover':{ bgcolor:'#3451d1' } }}>
                  Generate My Tasks
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2.5,
                '@media (max-width:680px)':{ gridTemplateColumns:'1fr' } }}>
                <Column icon={<PendingActionsIcon sx={{ fontSize:18 }}/>} title="To Do"
                  count={newTasks.length} accentColor={C.primary} accentBg={C.newCol} borderColor={C.border}>
                  {newTasks.length===0
                    ? <Box sx={{ textAlign:'center', py:5 }}><CheckCircleIcon sx={{ fontSize:36, color:'#D1FAE5', mb:1 }}/><Typography fontSize={13} color={C.muted} fontWeight={600}>All done! 🎉</Typography></Box>
                    : newTasks.map((task,i) => <TaskCard key={task._id} task={task} onComplete={handleComplete} index={i}/>)}
                </Column>
                <Column icon={<TaskAltIcon sx={{ fontSize:18 }}/>} title="Completed"
                  count={completedTasks.length} accentColor={C.success} accentBg={C.doneCol} borderColor="#BBF7D0">
                  {completedTasks.length===0
                    ? <Box sx={{ textAlign:'center', py:5 }}><TaskAltIcon sx={{ fontSize:36, color:C.border, mb:1 }}/><Typography fontSize={13} color={C.muted}>Mark tasks done to see them here</Typography></Box>
                    : completedTasks.map((task,i) => <TaskCard key={task._id} task={task} onComplete={handleComplete} index={i}/>)}
                </Column>
              </Box>
            )}

            {tasks.length > 0 && (
              <Box sx={{ textAlign:'center', mt:3, display:'flex', gap:1.5, justifyContent:'center', flexWrap:'wrap' }}>
                <Button size="small" variant="outlined" startIcon={<AutoAwesomeIcon sx={{ fontSize:14 }}/>}
                  onClick={() => navigate(`/user/generate-tasks/${activeProject._id}`)}
                  sx={{ fontSize:12, borderRadius:2, borderColor:C.border, color:C.muted, textTransform:'none',
                    '&:hover':{ borderColor:C.primary, color:C.primary, bgcolor:C.primarySoft } }}>
                  Regenerate Tasks
                </Button>
                <Button size="small" variant="outlined"
                  startIcon={rebalancing?<CircularProgress size={12}/>:<TuneIcon sx={{ fontSize:14 }}/>}
                  onClick={handleRebalance} disabled={rebalancing}
                  sx={{ fontSize:12, borderRadius:2, borderColor:C.border, color:C.primary, textTransform:'none',
                    '&:hover':{ borderColor:C.primary, bgcolor:C.primarySoft } }}>
                  {rebalancing?'Rebalancing...':'Rebalance Task Dates'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Taskboard;