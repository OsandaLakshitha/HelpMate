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
import UserNavbar from "./components/user/UserNavbar";

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
import StudyDashboard from "./pages/user/StudyDashboard";
import ExamPrepPage from './pages/user/ExamPrepPage';

// 404 Page
import NotFound from "./pages/NotFound";


// ──  MASSS imports ────────────────────────────────────────────────────
import { MasssLayout }         from "./features/masss/components/layout/MasssLayout";
import MasssProtectedRoute     from "./features/masss/components/MasssProtectedRoute";
import { MasssProvider }       from "./features/masss/context/MasssContext";

// Lazy load MASSS pages for performance
import { lazy, Suspense } from "react";

const MasssOnboarding   = lazy(() => import("./features/masss/pages/OnboardingPage"));
const MasssDashboard    = lazy(() => import("./features/masss/pages/DashboardPage"));
const MasssSchedule     = lazy(() => import("./features/masss/pages/SchedulePage"));
const MasssModules      = lazy(() => import("./features/masss/pages/ModulesPage"));
const MasssModuleDetail = lazy(() => import("./features/masss/pages/ModuleDetailPage"));
const MasssTasksPage    = lazy(() => import("./features/masss/pages/TasksPage"));
const MassFocusPage     = lazy(() => import("./features/masss/pages/FocusPage"));
const MasssSessionsPage = lazy(() => import("./features/masss/pages/SessionsPage"));
const MasssInsights     = lazy(() => import("./features/masss/pages/InsightsPage"));
const MasssSettings     = lazy(() => import("./features/masss/pages/SettingsLayout"));
const MasssProfile      = lazy(() => import("./features/masss/pages/ProfilePage"));
const MasssSlots        = lazy(() => import("./features/masss/pages/SlotsPage"));
const MasssRoutine      = lazy(() => import("./features/masss/pages/RoutinePage"));

// MASSS loading fallback — dark theme matches MASSS layout
const MasssLoader = () => (
  <div
    className="flex items-center justify-center h-screen"
    style={{ background: '#F0FAF9' }}
  >
    <div
      className="w-7 h-7 rounded-full border-2 masss-spin"
      style={{ borderColor: '#C7F0EB', borderTopColor: '#0FA89E' }}
    />
  </div>
)

// Wrap a lazy component with Suspense
const Lazy = ({ component: Component }) => (
  <Suspense fallback={<MasssLoader />}>
    <Component />
  </Suspense>
)


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
            <Route path="dashboard" element={<StudyDashboard />} />
            <Route path="career" element={<UserCareer />} />
            <Route path="wellness" element={<UserWellness />} />
            <Route path="files" element={<UserFiles />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="job-recommendation" element={<JobRecomendation />} />
            <Route path="peer-matching" element={<PeerMatching />} />
            <Route path="/user/notes/upload" element={<NotesUpload />} />
            <Route path="/user/notes/list" element={<MyNotes />} />
            <Route path="notes/:id" element={<NoteDetail />} />
            <Route path="/user/exam-prep/:examId" element={<ExamPrepPage />} />
          </Route>

                 {/* ── MASSS Routes ───────────────────────────────────────── */}
          {/*
            Structure:
              ProtectedRoute      ← Helpmate auth (user must be logged in)
                MasssProtectedRoute ← MASSS onboarding check
                  MasssLayout       ← MASSS dark shell + MasssProvider
                    child pages...
          */}

          {/* Onboarding — outside MasssLayout (no sidebar) */}
          <Route
            path="/masss/onboarding"
            element={
              <ProtectedRoute>
                <MasssProvider>
                  <MasssProtectedRoute>
                    <Lazy component={MasssOnboarding} />
                  </MasssProtectedRoute>
                </MasssProvider>
              </ProtectedRoute>
            }
          />

          {/* All MASSS app pages — inside MasssLayout */}
          {/* MasssLayout already wraps with MasssProvider internally */}
          <Route
            path="/masss"
            element={
              <ProtectedRoute>
                <MasssProtectedRoute>
                  <MasssLayout />
                </MasssProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/masss/dashboard" replace />} />
            <Route path="dashboard"      element={<Lazy component={MasssDashboard} />} />
            <Route path="schedule"       element={<Lazy component={MasssSchedule} />} />
            <Route path="modules"        element={<Lazy component={MasssModules} />} />
            <Route path="modules/:id"    element={<Lazy component={MasssModuleDetail} />} />
            <Route path="tasks"          element={<Lazy component={MasssTasksPage} />} />
            <Route path="focus"          element={<Lazy component={MassFocusPage} />} />
            <Route path="focus/:taskId"  element={<Lazy component={MassFocusPage} />} />
            <Route path="sessions"       element={<Lazy component={MasssSessionsPage} />} />
            <Route path="ai-insights"    element={<Lazy component={MasssInsights} />} />

            {/* Settings — nested */}
            <Route path="settings" element={<Lazy component={MasssSettings} />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<Lazy component={MasssProfile} />} />
              <Route path="slots"   element={<Lazy component={MasssSlots} />} />
              <Route path="routine" element={<Lazy component={MasssRoutine} />} />
            </Route>
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

export default App;
