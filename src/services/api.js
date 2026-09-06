import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach stored JWT token
apiClient.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('finsmart_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (e) {
        // Ignore JSON parse error
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful error normalization
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.error?.message ||
      error.message ||
      'Network request failed. Operating in offline resilient mode.';
    return Promise.reject(new Error(errorMsg));
  }
);
