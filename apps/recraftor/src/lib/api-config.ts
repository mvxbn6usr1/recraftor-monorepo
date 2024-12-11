import axios from 'axios';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL;

if (!PORTAL_URL) {
  throw new Error('Missing VITE_PORTAL_URL environment variable');
}

// Base API client for general portal endpoints
export const api = axios.create({
  baseURL: `${PORTAL_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Specialized API client for Recraft endpoints
export const recraftApi = axios.create({
  baseURL: `${PORTAL_URL}/api/recraft`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
recraftApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error('Recraft API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.error?.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
    return Promise.reject(error);
  }
);