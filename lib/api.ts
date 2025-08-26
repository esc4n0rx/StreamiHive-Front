import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '@/types/api.types';

const API_BASE_URL = 'https://api.streamhive.icu';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('streamhive_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('streamhive_token');
      localStorage.removeItem('streamhive_current_user');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/')) {
        window.location.href = '/';
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const message = error.response?.data?.message || 'Too many requests. Please try again later.';
      return Promise.reject(new Error(message));
    }

    // Extract error message
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Helper function to handle API responses
export const handleApiResponse = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data as T;
};

// Helper function to handle API errors
export const handleApiError = (error: any): never => {
  if (error.response?.data?.errors) {
    // Validation errors
    const validationErrors = error.response.data.errors as Array<{field: string, message: string}>;
    const firstError = validationErrors[0];
    throw new Error(firstError.message);
  }
  
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  
  throw new Error(error.message || 'An unexpected error occurred');
};

export default api;