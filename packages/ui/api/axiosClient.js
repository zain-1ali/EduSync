import axios from 'axios';

export const apiClient = axios.create({
  // Use your backend URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('edusync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});