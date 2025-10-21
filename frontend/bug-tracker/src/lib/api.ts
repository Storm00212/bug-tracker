/**
 * API SERVICE LAYER
 *
 * Centralized HTTP client for backend communication.
 * Handles authentication, error handling, and request/response interceptors.
 * Uses Axios for HTTP requests with automatic JWT token attachment.
 */

import axios from 'axios';

// Backend API base URL - change this for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');

    // Attach token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response?.status === 401) {
      // Token expired or invalid - clear local storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle specific JWT errors
      const errorMessage = error.response.data?.message;
      if (errorMessage === 'Malformed token format' ||
          errorMessage === 'Token has expired' ||
          errorMessage === 'Invalid token signature') {
        // Clear invalid token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Return error for component-level handling
    return Promise.reject(error);
  }
);

// Export configured axios instance
export default api;

// Export API base URL for components that need it
export { API_BASE_URL };