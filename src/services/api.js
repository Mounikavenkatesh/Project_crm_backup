import axios from 'axios';
import toast from 'react-hot-toast';

// Create configured Axios instance using environment variable base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request Interceptor: Automatically inject JWT Bearer Token if it exists in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global handler for unauthorized access (401) and connectivity issues
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 1. Session expired or unauthorized: Clear stored credentials and redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('crm-token');
        // Prevent infinite loop if already on login or register page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // 2. Network connectivity issue
      toast.error('Cannot connect to server. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };
