import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('fleet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauth vs forbidden
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // 401 Unauthorized: token expired or invalid -> clear and redirect to login
        sessionStorage.removeItem('fleet_token');
        sessionStorage.removeItem('fleet_user');
        localStorage.removeItem('fleet_token');
        localStorage.removeItem('fleet_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        // 403 Forbidden: user is authenticated but lacks required role -> DO NOT log out
        console.warn('Access Denied (403): You do not have permission to perform this action.');
      }
      return Promise.reject(error.response.data || error.response);
    }
    return Promise.reject(error);
  }
);

export default api;
