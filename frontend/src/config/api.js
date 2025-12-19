// src/config/api.js
import axios from 'axios';

// 1. Helper to determine the backend URL
const getApiUrl = () => {
  // If defined in .env (e.g., VITE_API_URL=https://api.myapp.com)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development default for FastAPI (Port 8000)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000'; 
  }
  
  // Production default
  return 'https://api.helpmate.com';
};

export const API_URL = getApiUrl();

// 2. Create the Axios Instance (The "api" object)
// This is what we will use in our features (like test-crud)
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Optional: Add an interceptor to attach tokens automatically (for Auth later)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // or however you store it
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. Export the axios instance as default
export default api;





// 4. (Optional) Keep these for legacy code reference, 
// but update paths to match your FastAPI routers.
export const endpoints = {
  auth: {
    login: '/auth/login',      // Axios will append this to baseURL
    register: '/auth/register',
    me: '/auth/me',
  },
  // Use relative paths now because Axios handles the domain
  admin: {
    stats: '/admin/dashboard/stats',
  },

  

};