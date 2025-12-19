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
// This is the SINGLE shared instance used by all features
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 3. Interceptor to attach tokens automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 4. Export the axios instance as default
export default api;