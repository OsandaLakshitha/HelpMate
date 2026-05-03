// ── OnboardingGuard.jsx ───────────────────────────────────────────────────────
// Wrap any route that requires onboarding to be completed.
// If onboarding is not done → redirects to /user/onboarding automatically.
//
// Usage in App.jsx:
//   <Route path="/user/projects" element={
//     <OnboardingGuard><ProjectList /></OnboardingGuard>
//   } />

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useProfile from '../../context/useProfile';

const OnboardingGuard = ({ children }) => {
  const { loading, onboardingDone } = useProfile();

  // Still checking
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Not done → send to onboarding
  if (!onboardingDone) {
    return <Navigate to="/user/onboarding" replace />;
  }

  // Done → render page
  return children;
};

export default OnboardingGuard;