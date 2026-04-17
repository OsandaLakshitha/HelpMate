// src/config/api.js
const getApiUrl = () => {
  // For Vite
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development default
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }
  
  // Production default
  return 'https://api.helpmate.com'; // Change to your production URL
};

export const API_URL = getApiUrl();

export const endpoints = {
  // Auth endpoints
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    me: `${API_URL}/api/auth/me`,
    updateProfile: `${API_URL}/api/auth/update-profile`,
    updatePassword: `${API_URL}/api/auth/update-password`,
    forgotPassword: `${API_URL}/api/auth/forgot-password`,
    resetPassword: `${API_URL}/api/auth/reset-password`,
  },
  
  // Admin endpoints
  admin: {
    stats: `${API_URL}/api/admin/dashboard/stats`,
    users: `${API_URL}/api/admin/users`,
    createAdmin: `${API_URL}/api/admin/create-admin`,
  },
  
  // Pricing endpoints
  pricing: {
    all: `${API_URL}/api/pricing`,
    tiers: `${API_URL}/api/pricing/tiers`,
    config: `${API_URL}/api/pricing/config`,
    faqs: `${API_URL}/api/pricing/faqs`,
  },
};