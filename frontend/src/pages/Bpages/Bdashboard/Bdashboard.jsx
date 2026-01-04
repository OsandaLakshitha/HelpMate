import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, FolderOpen, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import axios from 'axios';

import { API_URL } from '../../../config/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    user: { name: 'User', greeting: 'Good morning' },
    stats: { newTasks: 0, inProgressTasks: 0, openProjects: 0 },
    tasks: [],
    upcomingTasks: [],
    calendar: { today: new Date().toISOString(), events: {}, todayTasks: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      console.log('[Dashboard] Fetching data from backend...');

      const response = await axios.get(`${API_URL}/api/user/dashboard-summary`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[Dashboard] Response received:', response.data);

      if (response.data.success) {
        setDashboardData(response.data);
        console.log('[Dashboard] Dashboard data updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }

    } catch (error) {
      console.error('[Dashboard] Error fetching dashboard data:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(error.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    // Adjust for timezone offset to get the correct date
    const offset = d.getTimezoneOffset();
    const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const hasEvents = dashboardData.calendar?.events?.[dateStr];
      const isToday = dateStr === formatDate(new Date());
      const isSelected = dateStr === formatDate(selectedDate);
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-6 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all ${
            isToday ? 'bg-blue-500 text-white font-bold' :
            isSelected ? 'bg-blue-100 text-blue-700' :
            'hover:bg-gray-100'
          }`}
        >
          <span className="text-sm">{day}</span>
          {hasEvents && (
            <div className="flex gap-0.5 mt-0.5">
              {[...Array(Math.min(hasEvents, 3))].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-blue-500'}`}></div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'To Be Reviewed': return 'bg-purple-100 text-purple-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'New': return <Clock className="w-3 h-3" />;
      case 'In Progress': return <TrendingUp className="w-3 h-3" />;
      case 'To Be Reviewed': return <AlertCircle className="w-3 h-3" />;
      case 'Completed': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return { text: 'No due date', color: 'text-gray-400' };
    
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-orange-500' };
    return { text: `${diffDays} days left`, color: 'text-gray-600' };
  };

  const totalOngoingTasks = dashboardData.stats.newTasks + dashboardData.stats.inProgressTasks;

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <div className="flex h-full">
        {/* Left Section - 60% */}
        <div className="w-3/5 h-full flex flex-col p-6 space-y-4">
          {/* Greeting Section - 35% height */}
          <div className="h-[45%] space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {dashboardData.user.greeting}, {dashboardData.user.name}! 👋
                </h1>
                
              </div>
              
              <div className=" grid grid-cols-3 gap-4 mt-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">To Do</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.newTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">New tasks</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">In Progress</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{dashboardData.stats.inProgressTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">Active tasks</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <FolderOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Projects</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.stats.openProjects}</p>
                  <p className="text-xs text-gray-500 mt-1">Open projects</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ongoing Tasks Section - 65% height */}
          <div className="h-[65%] bg-white rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ongoing Tasks</h2>
                <p className="text-xs text-gray-500 mt-1">
                  To Do ({dashboardData.stats.newTasks}) + In Progress ({dashboardData.stats.inProgressTasks})
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-600">{totalOngoingTasks}</span>
                <p className="text-xs text-gray-500">total ongoing</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              {dashboardData.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mb-2" />
                  <p className="font-medium">No ongoing tasks</p>
                  <p className="text-sm mt-1">All caught up! 🎉</p>
                </div>
              ) : (
                dashboardData.tasks.map(task => {
                  const dueInfo = getDaysUntilDue(task.dueDate);
                  return (
                    <div
                      key={task._id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{task.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description || 'No description'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} whitespace-nowrap ml-2 flex items-center gap-1`}>
                          {getStatusIcon(task.status)}
                          {task.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 font-medium flex items-center gap-1.5">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: task.projectColor || '#e0e0e0' }}
                            ></div>
                            {task.projectTitle}
                          </span>
                        </div>
                        <span className={`flex items-center gap-1 ${dueInfo.color} font-medium`}>
                          <Clock className="w-3 h-3" />
                          {dueInfo.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* Right Section - 40% */}
        <div className="w-2/5 h-full flex flex-col p-6 pl-0 space-y-4">
          {/* Calendar Section - 45% height */}
          <div className="h-[50%] bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">Calendar</h2>
            </div>
            {renderCalendar()}
          </div>
          
          {/* Upcoming Tasks - 55% height */}
          <div className="h-[55%] space-y-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-800">Reminder</h3>
              </div>
              <div className="space-y-2">
                {!dashboardData.upcomingTasks || dashboardData.upcomingTasks.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">No upcoming tasks in the next 7 days</p>
                ) : (
                  dashboardData.upcomingTasks.slice(0, 5).map(task => (
                    <div key={task._id} className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className="text-sm text-gray-700 truncate">{task.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;