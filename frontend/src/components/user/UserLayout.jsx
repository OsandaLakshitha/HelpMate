import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Crown,
  CreditCard,
  HelpCircle,
  Upload,
  FolderOpen,
  BookMarked,
  Layers,
  Target,
  FileCheck,
  Award,
  Users,
  UserPlus,
  UsersRound,
  MessageCircle,
  Compass,
  Smile,
  Activity,
  Calendar,
  BarChart3,
} from 'lucide-react';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Toggle dropdown menu
  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Navigation with dropdowns
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/user/dashboard', 
      icon: LayoutDashboard,
      type: 'link'
    },
    { 
      name: 'Study Tools', 
      icon: BookOpen,
      type: 'dropdown',
      children: [
        { name: 'Overview', href: '/user/study', icon: BarChart3 },
        { name: 'My Notes', href: '/user/notes/list', icon: FolderOpen },
        { name: 'Upload Notes', href: '/user/notes/upload', icon: Upload },
        { name: 'Flash Cards', href: '/user/flashcards', icon: Layers },
        { name: 'Quiz History', href: '/user/quiz-history', icon: BookMarked },
      ]
    },
    { 
      name: 'Career', 
      icon: Briefcase,
      type: 'dropdown',
      children: [
        { name: 'Overview', href: '/user/career', icon: Compass },
        { name: 'Job Recommendations', href: '/user/job-recommendation', icon: Target },
        { name: 'Resume Builder', href: '/user/resume', icon: FileCheck },
        { name: 'Skills Assessment', href: '/user/skills', icon: Award },
      ]
    },
    { 
      name: 'Community', 
      icon: Users,
      type: 'dropdown',
      children: [
        { name: 'Peer Matching', href: '/user/peer-matching', icon: UsersRound },
        { name: 'Find Study Partners', href: '/user/find-partners', icon: UserPlus },
        { name: 'Study Groups', href: '/user/groups', icon: Users },
        { name: 'Messages', href: '/user/messages', icon: MessageCircle },
      ]
    },
    { 
      name: 'Wellness', 
      icon: Heart,
      type: 'dropdown',
      children: [
        { name: 'Overview', href: '/user/wellness', icon: Activity },
        { name: 'Mood Tracker', href: '/user/mood', icon: Smile },
        { name: 'Meditation', href: '/user/meditation', icon: Heart },
        { name: 'Schedule', href: '/user/schedule', icon: Calendar },
      ]
    },
    { 
      name: 'My Files', 
      href: '/user/files', 
      icon: FileText,
      type: 'link'
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a path is active
  const isActive = (href) => location.pathname === href;
  
  // Check if any child is active (for dropdown highlighting)
  const isChildActive = (children) => {
    return children?.some(child => 
      location.pathname === child.href || location.pathname.startsWith(child.href + '/')
    );
  };

  // Auto-expand menu if child is active
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.type === 'dropdown' && isChildActive(item.children)) {
        setExpandedMenus(prev => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        className="fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 lg:translate-x-0 transition-transform duration-300 flex flex-col"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-teal-600 bg-clip-text text-transparent">
              HelpMate
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center space-x-1">
                {user?.plan === 'Pro' && <Crown className="w-3 h-3 text-amber-500" />}
                {user?.plan === 'Enterprise' && <Crown className="w-3 h-3 text-purple-500" />}
                <p className="text-xs text-slate-500">{user?.plan || 'Free'} Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            if (item.type === 'link') {
              // Simple link
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            } else {
              // Dropdown menu
              const isExpanded = expandedMenus[item.name];
              const hasActiveChild = isChildActive(item.children);
              
              return (
                <div key={item.name} className="space-y-1">
                  {/* Dropdown Header */}
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      hasActiveChild
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  {/* Dropdown Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 space-y-1">
                          {item.children.map((child) => {
                            const childActive = isActive(child.href);
                            return (
                              <Link
                                key={child.name}
                                to={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                  childActive
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <child.icon className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm font-medium">{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
          })}

          {/* Upgrade Banner (Free users) */}
          {user?.plan === 'Free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5 text-amber-300" />
                <p className="text-white font-semibold text-sm">Upgrade to Pro</p>
              </div>
              <p className="text-xs text-teal-100 mb-3">
                Unlock unlimited notes, advanced AI features & more
              </p>
              <Link to="/pricing">
                <button className="w-full px-3 py-2 bg-white text-teal-600 rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                  View Plans
                </button>
              </Link>
            </motion.div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 p-3 space-y-1 flex-shrink-0">
          <Link
            to="/user/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/user/settings')
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <Link
            to="/help"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Help & Support</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb or Page Title */}
          <div className="hidden lg:flex items-center space-x-2 text-sm">
            <Link to="/user/dashboard" className="text-slate-500 hover:text-teal-600">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">
              {navigation.find(n => 
                n.href === location.pathname || 
                n.children?.some(c => c.href === location.pathname)
              )?.name || 
              navigation.flatMap(n => n.children || []).find(c => c.href === location.pathname)?.name ||
              'Dashboard'}
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes, files, or features..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
              />
              <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-400 bg-slate-100 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Upload Button */}
            <Link
              to="/user/notes/upload"
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Link>

            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {user?.plan === 'Pro' ? (
                              <Crown className="w-4 h-4 text-amber-500" />
                            ) : user?.plan === 'Enterprise' ? (
                              <Crown className="w-4 h-4 text-purple-500" />
                            ) : (
                              <Crown className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-sm font-medium">{user?.plan || 'Free'} Plan</span>
                          </div>
                          {user?.plan === 'Free' && (
                            <Link 
                              to="/pricing"
                              className="text-xs text-teal-600 font-medium hover:underline"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              Upgrade
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/user/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/user/billing"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <CreditCard className="w-5 h-5" />
                          <span>Billing</span>
                        </Link>
                        <Link
                          to="/user/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                        <Link
                          to="/help"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <HelpCircle className="w-5 h-5" />
                          <span>Help & Support</span>
                        </Link>
                      </div>

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
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;