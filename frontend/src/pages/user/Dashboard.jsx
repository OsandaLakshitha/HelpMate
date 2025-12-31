import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Briefcase,
  Heart,
  Upload,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Target,
  Zap,
  Crown,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  BarChart,
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    notesProcessed: 12,
    flashcardsCreated: 45,
    studyHours: 18,
    jobsMatched: 8,
    cvAnalyzed: 3,
    wellnessScore: 85,
  });

  const quickActions = [
    {
      title: 'Upload Notes',
      description: 'Transform your notes into flashcards',
      icon: Upload,
      gradient: 'from-teal-500 to-cyan-500',
      link: '/user/notes/upload',
    },
    {
      title: 'All Notes',
      description: 'Transform your notes into flashcards',
      icon: Upload,
      gradient: 'from-teal-500 to-cyan-500',
      link: '/user/notes/list',
    },
    {
      title: 'Analyze CV',
      description: 'Get AI-powered CV insights',
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-500',
      link: '/user/cv/analyze',
    },
    {
      title: 'Find Jobs',
      description: 'Discover matching opportunities',
      icon: Briefcase,
      gradient: 'from-purple-500 to-pink-500',
      link: '/user/jobs',
    },
    {
      title: 'Wellness Check',
      description: 'Track your mental health',
      icon: Heart,
      gradient: 'from-emerald-500 to-teal-500',
      link: '/user/wellness',
    },
  ];

  const recentActivities = [
    { type: 'note', title: 'Introduction to Algorithms', date: '2 hours ago', status: 'completed' },
    { type: 'cv', title: 'CV Analysis - Software Engineer', date: '1 day ago', status: 'completed' },
    { type: 'job', title: 'Applied to Google Internship', date: '2 days ago', status: 'pending' },
    { type: 'wellness', title: 'Completed Meditation Session', date: '3 days ago', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-slate-600">
                Here's what's happening with your studies today
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Plan Badge */}
              <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                user?.plan === 'Free' ? 'bg-slate-100' :
                user?.plan === 'Pro' ? 'bg-gradient-to-r from-teal-500 to-cyan-500' :
                'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}>
                {user?.plan === 'Pro' ? <Crown className="w-4 h-4 text-white" /> :
                 user?.plan === 'Enterprise' ? <Award className="w-4 h-4 text-white" /> :
                 <Zap className="w-4 h-4 text-slate-600" />}
                <span className={`font-semibold text-sm ${
                  user?.plan === 'Free' ? 'text-slate-700' : 'text-white'
                }`}>
                  {user?.plan} Plan
                </span>
              </div>
              {user?.plan === 'Free' && (
                <Link to="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    Upgrade
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Notes Processed"
            value={stats.notesProcessed}
            icon={BookOpen}
            gradient="from-teal-500 to-cyan-500"
            change="+12%"
          />
          <StatCard
            title="Flashcards Created"
            value={stats.flashcardsCreated}
            icon={Brain}
            gradient="from-blue-500 to-indigo-500"
            change="+8%"
          />
          <StatCard
            title="Study Hours"
            value={`${stats.studyHours}h`}
            icon={Clock}
            gradient="from-purple-500 to-pink-500"
            change="+15%"
          />
          <StatCard
            title="Wellness Score"
            value={`${stats.wellnessScore}%`}
            icon={Heart}
            gradient="from-emerald-500 to-teal-500"
            change="+5%"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} action={action} index={index} />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              <Link to="/user/activity" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </div>

          {/* Study Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">This Week's Progress</h2>
            <div className="space-y-6">
              <ProgressItem label="Study Goals" value={75} color="teal" />
              <ProgressItem label="Job Applications" value={50} color="blue" />
              <ProgressItem label="Wellness Tasks" value={90} color="emerald" />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Weekly Streak</span>
                <span className="text-2xl font-bold text-teal-600">7 🔥</span>
              </div>
              <p className="text-xs text-slate-600">
                You're on fire! Keep it up to maintain your streak.
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA (for Free users) */}
        {user?.plan === 'Free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="max-w-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <span className="text-white font-semibold">Upgrade to Pro</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Unlock Premium Features
                </h3>
                <p className="text-cyan-100 mb-4">
                  Get unlimited AI summaries, advanced analytics, and priority support for just $12/month.
                </p>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white">Unlimited everything</span>
                </div>
              </div>
              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-teal-600 rounded-full font-semibold text-lg hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <span>Upgrade Now</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, gradient, change }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-semibold text-green-600">{change}</span>
      </div>
      <p className="text-sm text-slate-600 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </motion.div>
  );
};

// Quick Action Card
const QuickActionCard = ({ action, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Link to={action.link}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-xl transition-all group cursor-pointer">
          <div className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <action.icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{action.title}</h3>
          <p className="text-sm text-slate-600 mb-3">{action.description}</p>
          <div className="flex items-center text-teal-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            Get Started <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Activity Item
const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'note': return BookOpen;
      case 'cv': return FileText;
      case 'job': return Briefcase;
      case 'wellness': return Heart;
      default: return FileText;
    }
  };

  const Icon = getIcon(activity.type);

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        activity.type === 'note' ? 'bg-teal-100' :
        activity.type === 'cv' ? 'bg-blue-100' :
        activity.type === 'job' ? 'bg-purple-100' :
        'bg-emerald-100'
      }`}>
        <Icon className={`w-5 h-5 ${
          activity.type === 'note' ? 'text-teal-600' :
          activity.type === 'cv' ? 'text-blue-600' :
          activity.type === 'job' ? 'text-purple-600' :
          'text-emerald-600'
        }`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
        <p className="text-xs text-slate-600">{activity.date}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {activity.status}
      </span>
    </div>
  );
};

// Progress Item
const ProgressItem = ({ label, value, color }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-2 rounded-full bg-gradient-to-r ${
            color === 'teal' ? 'from-teal-500 to-cyan-500' :
            color === 'blue' ? 'from-blue-500 to-indigo-500' :
            'from-emerald-500 to-teal-500'
          }`}
        />
      </div>
    </div>
  );
};

export default UserDashboard;