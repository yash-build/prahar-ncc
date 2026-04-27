/**
 * services/api.js
 * Base Axios instance — all API calls go through this.
 * Token injection handled in AuthContext.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000, // 15s timeout — important for slow connections
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — standardise error messages
api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Return a rejected promise with the message for easy catch
    return Promise.reject(new Error(message));
  }
);

export default api;
