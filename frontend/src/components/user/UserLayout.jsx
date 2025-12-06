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
  User,
  FileText,
  Crown,
  CreditCard,
  HelpCircle,
} from 'lucide-react';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Study Tools', href: '/user/study', icon: BookOpen },
    { name: 'Career', href: '/user/career', icon: Briefcase },
    { name: 'Wellness', href: '/user/wellness', icon: Heart },
    { name: 'My Files', href: '/user/files', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        className="fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 lg:translate-x-0 transition-transform duration-300"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
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
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center space-x-1">
                {user?.plan === 'Pro' && <Crown className="w-3 h-3 text-teal-600" />}
                <p className="text-xs text-slate-600">{user?.plan} Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Upgrade Banner (Free users) */}
          {user?.plan === 'Free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5 text-white" />
                <p className="text-white font-semibold text-sm">Upgrade to Pro</p>
              </div>
              <p className="text-xs text-teal-100 mb-3">
                Unlock unlimited features and advanced tools
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
        <div className="border-t border-slate-200 p-4 space-y-1">
          <Link
            to="/user/settings"
            className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <Link
            to="/help"
            className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Help</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 rounded-lg">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{user?.plan} Plan</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2"
                  >
                    <Link
                      to="/user/profile"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/user/billing"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Billing</span>
                    </Link>
                    <Link
                      to="/user/settings"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-slate-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;