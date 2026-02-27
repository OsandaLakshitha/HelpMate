import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useTheme, alpha } from '@mui/material/styles';
import { useAuth } from '../../../context/AuthContext';
import {
  Container, Typography, CircularProgress, Alert, Paper, Grid, Box,
  useMediaQuery, LinearProgress
} from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// --- System Pastel Palette ---
const PASTEL_COLORS = ['#A7D7C5', '#74B49B', '#5C8D89', '#DAE9E4'];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper elevation={0} sx={{
    p: 3, borderRadius: 4, border: '1px solid #e0eadd',
    background: `linear-gradient(135deg, #ffffff 0%, ${alpha(color, 0.08)} 100%)`,
    height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    width: '100%'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="h3" sx={{ mr: 2 }}>{icon}</Typography>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="800" color="#2D5C4C">{value}</Typography>
      </Box>
    </Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{subtitle}</Typography>
  </Paper>
);

const InsightPage = () => {
  const { user, token } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/insights/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Insights API Response:', res.data); // Debug log
        setInsights(res.data);
      } catch (err) {
        setError('Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [user, token]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="success" /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  // Debug log to check insights structure
  console.log('Current insights state:', insights);

  const statusData = [
    { name: 'To Do', value: insights.taskStats.new },
    { name: 'In Progress', value: insights.taskStats.inProgress },
    { name: 'Review', value: insights.taskStats.toBeReviewed },
    { name: 'Done', value: insights.taskStats.completed },
  ];

  const completedPct = ((insights.taskStats.completed / (insights.taskStats.total || 1)) * 100).toFixed(1);

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 6, px: { xs: 2, md: 4 } }}>
      
      {/* PAGE HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" color="#2D5C4C" sx={{ mb: 0.5 }}>Insights</Typography>
        <Typography variant="subtitle1" color="text.secondary" fontWeight="500">Task Insights</Typography>
      </Box>

      {/* TOP ROW: 4 STAT CARDS (Now md={3} for 4 equal columns) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Tasks" 
            value={insights.taskStats.total} 
            icon="📁" 
            color="#A7D7C5" 
            subtitle="Overall workload" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Tasks Created" 
            value={insights.createdTasks?.total || insights.taskStats?.created || 0} 
            icon="✍️" 
            color="#A7D7C5" 
            subtitle="Authored by you" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Completion Rate" 
            value={`${completedPct}%`} 
            icon="🎯" 
            color="#74B49B" 
            subtitle="Overall productivity score" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Last Activity" 
            value="1h" 
            icon="⚡" 
            color="#5C8D89" 
            subtitle="Updated recently" 
          />
        </Grid>
      </Grid>

      {/* BOTTOM ROW: 65/35 ALIGNMENT */}
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2.5, width: '100%' }}>
        
        {/* PIE CHART SECTION (65%) */}
        <Paper sx={{ width: isMobile ? '100%' : '65%', p: 4, borderRadius: 4, border: '1px solid #e0eadd', minHeight: '580px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight="700" color="#2D5C4C">Task Distribution</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Workload breakdown by status</Typography>
          
          <Box sx={{ flexGrow: 1, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius="68%" outerRadius="88%" paddingAngle={8} dataKey="value" stroke="none">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} cornerRadius={12} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
               <Typography variant="h2" fontWeight="900" color="#2D5C4C">{insights.taskStats.total}</Typography>
               <Typography variant="subtitle1" fontWeight="700" color="text.secondary">TASKS</Typography>
            </Box>
          </Box>
        </Paper>

        {/* PROGRESS TRACKER SECTION (35%) */}
        <Paper sx={{ width: isMobile ? '100%' : '35%', p: 4, borderRadius: 4, border: '1px solid #e0eadd', minHeight: '580px' }}>
          <Typography variant="h6" fontWeight="700" color="#2D5C4C" sx={{ mb: 4 }}>Progress Tracker</Typography>
          
          <Box sx={{ mb: 5 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" fontWeight="700">Total Completion</Typography>
                <Typography variant="body2" fontWeight="800" color="#74B49B">{completedPct}%</Typography>
             </Box>
             <LinearProgress variant="determinate" value={parseFloat(completedPct)} sx={{ height: 12, borderRadius: 6, backgroundColor: '#F4F9F4', '& .MuiLinearProgress-bar': { backgroundColor: '#74B49B' } }} />
          </Box>

          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1.2, mb: 3, display: 'block' }}>Detailed Breakdown</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {statusData.map((item, index) => (
              <Box key={item.name}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: PASTEL_COLORS[index] }} />
                    <Typography variant="body2" fontWeight="700">{item.name}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="800">{item.value}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(item.value / (insights.taskStats.total || 1)) * 100} sx={{ height: 8, borderRadius: 4, backgroundColor: '#F4F9F4', '& .MuiLinearProgress-bar': { backgroundColor: PASTEL_COLORS[index] } }} />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default InsightPage;