// src/components/user/UserNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Brain,
  Sparkles,
  ChevronDown,
  Bell,
  Search,
  Upload,
  User,
  Settings,
  CreditCard,
  LogOut,
  HelpCircle,
  Crown,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Briefcase,
  Users,
  Heart,
  FileText,
  FolderOpen,
  Layers,
  BookMarked,
  Target,
  FileCheck,
  Award,
  UserPlus,
  UsersRound,
  MessageCircle,
  Smile,
  Activity,
  Calendar,
  BarChart3,
  Compass,
} from 'lucide-react';

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      href: '/user/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Study',
      icon: BookOpen,
      dropdown: [
        { name: 'Overview', href: '/user/study', icon: BarChart3, description: 'Your study dashboard' },
        { name: 'My Notes', href: '/user/notes/list', icon: FolderOpen, description: 'View all your notes' },
        { name: 'Upload Notes', href: '/user/notes/upload', icon: Upload, description: 'Upload new PDF notes' },
        { name: 'Flash Cards', href: '/user/flashcards', icon: Layers, description: 'Study with flash cards' },
        { name: 'Quiz History', href: '/user/quiz-history', icon: BookMarked, description: 'View past quizzes' },
      ]
    },
    {
      name: 'Career',
      icon: Briefcase,
      dropdown: [
        { name: 'Overview', href: '/user/career', icon: Compass, description: 'Career guidance hub' },
        { name: 'Job Recommendations', href: '/user/job-recommendation', icon: Target, description: 'AI-matched jobs for you' },
        { name: 'Resume Builder', href: '/user/resume', icon: FileCheck, description: 'Build your resume' },
        { name: 'Skills Assessment', href: '/user/skills', icon: Award, description: 'Assess your skills' },
      ]
    },
    {
      name: 'Community',
      icon: Users,
      dropdown: [
        { name: 'Peer Matching', href: '/user/peer-matching', icon: UsersRound, description: 'Find study partners' },
        { name: 'Find Partners', href: '/user/find-partners', icon: UserPlus, description: 'Connect with peers' },
        { name: 'Study Groups', href: '/user/groups', icon: Users, description: 'Join study groups' },
        { name: 'Messages', href: '/user/messages', icon: MessageCircle, description: 'Chat with peers' },
      ]
    },
    {
      name: 'workspace',
      icon: Heart,
      dropdown: [
        { name: 'workspace', href: '/user/workspace', icon: Activity, description: 'get a quick daily summary' },
        { name: 'projects', href: '/user/projects', icon: Smile, description: 'Track your projects' },
        { name: 'taskboard', href: '/user/taskboard', icon: Heart, description: 'track your tasks' },
        { name: 'insights', href: '/user/insights', icon: Calendar, description: 'see your performance' },
      ]
    },
    {
      name: 'Files',
      href: '/user/files',
      icon: FileText,
    },
  ];

  const isActive = (href) => location.pathname === href;
  const isDropdownActive = (items) => items?.some(item => location.pathname.startsWith(item.href));

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-slate-200/50'
            : 'bg-white border-b border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/user/dashboard" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-teal-600 bg-clip-text text-transparent">
                HelpMate
              </span>
              <Sparkles className="w-4 h-4 text-teal-500 animate-pulse hidden sm:block" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              {navItems.map((item, index) => (
                <div key={item.name} className="relative">
                  {item.dropdown ? (
                    // Dropdown Item
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                        onMouseEnter={() => setOpenDropdown(index)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isDropdownActive(item.dropdown)
                            ? 'text-teal-600 bg-teal-50'
                            : 'text-slate-700 hover:text-teal-600 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === index ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {openDropdown === index && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            onMouseLeave={() => setOpenDropdown(null)}
                            className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                          >
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-start space-x-3 px-4 py-3 transition-all duration-200 ${
                                  isActive(subItem.href)
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div className={`p-2 rounded-lg ${
                                  isActive(subItem.href)
                                    ? 'bg-teal-100 text-teal-600'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  <subItem.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{subItem.name}</p>
                                  <p className="text-xs text-slate-500">{subItem.description}</p>
                                </div>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    // Regular Link
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-teal-600 bg-teal-50'
                          : 'text-slate-700 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              {/* Quick Upload */}
              <Link
                to="/user/notes/upload"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Link>

              {/* Notifications */}
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        
                        {/* Plan Badge */}
                        <div className="mt-3 flex items-center justify-between p-2.5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Crown className={`w-4 h-4 ${
                              user?.plan === 'Pro' ? 'text-amber-500' :
                              user?.plan === 'Enterprise' ? 'text-purple-500' :
                              'text-slate-400'
                            }`} />
                            <span className="text-sm font-medium text-slate-700">{user?.plan || 'Free'} Plan</span>
                          </div>
                          {user?.plan === 'Free' && (
                            <Link
                              to="/pricing"
                              onClick={() => setUserMenuOpen(false)}
                              className="text-xs font-medium text-teal-600 hover:text-teal-700"
                            >
                              Upgrade →
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/user/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-5 h-5 text-slate-500" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/user/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-5 h-5 text-slate-500" />
                          <span>Settings</span>
                        </Link>
                        <Link
                          to="/user/billing"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <CreditCard className="w-5 h-5 text-slate-500" />
                          <span>Billing</span>
                        </Link>
                        <Link
                          to="/help"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <HelpCircle className="w-5 h-5 text-slate-500" />
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-100 pt-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-200 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                {/* Search on Mobile */}
                <div className="relative mb-4">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                </div>

                {navItems.map((item, index) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === `mobile-${index}` ? null : `mobile-${index}`)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                            isDropdownActive(item.dropdown)
                              ? 'bg-teal-50 text-teal-700'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <ChevronDown className={`w-5 h-5 transition-transform ${
                            openDropdown === `mobile-${index}` ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        <AnimatePresence>
                          {openDropdown === `mobile-${index}` && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-6 py-2 space-y-1">
                                {item.dropdown.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    to={subItem.href}
                                    onClick={handleLinkClick}
                                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                                      isActive(subItem.href)
                                        ? 'bg-teal-500 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <subItem.icon className="w-4 h-4" />
                                    <span className="text-sm">{subItem.name}</span>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                          isActive(item.href)
                            ? 'bg-teal-500 text-white'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}

                {/* Upload Button Mobile */}
                <Link
                  to="/user/notes/upload"
                  onClick={handleLinkClick}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium mt-4"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Notes</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default UserNavbar;