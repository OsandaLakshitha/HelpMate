// ── useProfile.js ─────────────────────────────────────────────────────────────
// Custom hook — fetches BStudentProfile for the logged-in user.
// Used to check if onboarding is complete on app load.
//
// Usage:
//   const { profile, loading, onboardingDone } = useProfile();

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from './AuthContext';

const useProfile = () => {
  const { token, user } = useAuth();
  const [profile,        setProfile]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    if (!token || !user) { setLoading(false); return; }
    fetchProfile();
  }, [token, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.profile);
      setOnboardingDone(res.data.profile?.onboardingCompleted === true);
    } catch (err) {
      console.error('useProfile error:', err.message);
      setOnboardingDone(false);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, onboardingDone, refetch: fetchProfile };
};

export default useProfile;