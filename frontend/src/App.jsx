// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/admin/AdminLayout";
import UserLayout from "./components/user/UserLayout";

// Public Pages
import Home from "./pages/Home";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminPricing from "./pages/admin/PricingManagement";
import AdminSettings from "./pages/admin/Settings";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import UserStudy from "./pages/user/Study";
import UserCareer from "./pages/user/Career";
import UserWellness from "./pages/user/Wellness";
import UserFiles from "./pages/user/Files";
import UserProfile from "./pages/user/Profile";
import UserSettings from "./pages/user/Settings";
import JobRecomendation from "./pages/user/JobRecomendation";
import PeerMatching from "./pages/user/PeerMatching";
import NotesUpload from "./pages/user/NotesUpload";
import MyNotes from "./pages/user/MyNotes";
import NoteDetail from "./pages/user/NoteDetail";
import CreateProject from "./pages/Bpages/Bproject/createproject";
import Bprojectlist from "./pages/Bpages/Bproject/Bprojectlist";
import CreateTask from "./pages/Bpages/Btasks/Baddtask";
import TaskBoard from "./pages/Bpages/Btasks/Btaskboard";
import TaskDetails from "./pages/Bpages/Btasks/Bviewtask";
import ProjectView from "./pages/Bpages/Bproject/Bprojectview";
import Dashboard from "./pages/Bpages/Bdashboard/Bdashboard";
import ProjectTaskBoard from "./pages/Bpages/Btasks/Bprojecttaskboard";
import InsightPage from "./pages/Bpages/Binsight/Binsight";
import Bonboarding      from './pages/Bpages/Bonboarding';
import OnboardingGuard  from './components/Bcomponents/OnboardingGuard';
import BgenerateTask from './pages/Bpages/Btasks/BgenerateTask';

// 404 Page
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Navbar & Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Auth Routes (No Navbar/Footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* User Routes */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserLayout />
                <UserNavbar />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="study" element={<UserStudy />} />
            <Route path="career" element={<UserCareer />} />
            <Route path="wellness" element={<UserWellness />} />
            <Route path="files" element={<UserFiles />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="jobs" element={<JobRecomendation />} />
            <Route path="peer-matching" element={<PeerMatching />} />
            <Route path="/user/notes/upload" element={<NotesUpload />} />
            <Route path="/user/notes/list" element={<MyNotes />} />
            <Route path="notes/:id" element={<NoteDetail />} />
            <Route path="createproject" element={<CreateProject />} />
                       <Route path="/user/projects" element={
  <OnboardingGuard><Bprojectlist /></OnboardingGuard>
} />
                        <Route path="taskboard" element={<TaskBoard />} />
                        <Route path="addtask" element={<CreateTask />} />                        
                        <Route path="task/:id" element={<TaskDetails />} />
                        <Route path="projects/:id" element={<ProjectView />} />
                        <Route path="projects/:projectId/tasks" element={<ProjectTaskBoard />} />
                        <Route path="workspace" element={<Dashboard />} /> 
                        <Route path="insights" element={<InsightPage />}/>
                        <Route path="/user/onboarding" element={<Bonboarding />} />
                        <Route path="generate-tasks/:id" element={<BgenerateTask />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Public Layout Wrapper
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

// Import Outlet for layouts
import { Outlet } from "react-router-dom";
import UserNavbar from "./components/user/UserNavbar";

export default App;
