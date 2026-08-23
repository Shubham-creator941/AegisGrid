import axios from 'axios';
import { config } from '../config';
import { setupDemoAdapter } from '../mocks/demoAdapter';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupDemoAdapter(apiClient);

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aegis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      localStorage.removeItem('aegis_token');
      localStorage.removeItem('aegis_user');
      // Dispatch a custom event to notify components (like AppRouter) to redirect
      window.dispatchEvent(new Event('aegis_unauthorized'));
    }
    return Promise.reject(error);
  }
);
