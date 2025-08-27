import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@/types/api.types';
import { logger } from './logger';
import { NetworkUtils } from './network-utils';

const API_BASE_URL = 'https://api.streamhivex.icu';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for better debugging
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and logging
api.interceptors.request.use(
  (config) => {
    const requestId = NetworkUtils.generateRequestId();
    config.metadata = { ...config.metadata, requestId, startTime: Date.now() };

    // Add auth token
    const token = localStorage.getItem('streamhive_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log network diagnostics for auth requests
    if (config.url?.includes('/auth/')) {
      const networkInfo = NetworkUtils.getNetworkDiagnostics();
      logger.networkRequest({
        url: `${config.baseURL}${config.url}`,
        method: config.method?.toUpperCase() || 'GET',
        requestId,
        userAgent: navigator.userAgent,
        connectionType: networkInfo.connectionType,
        onlineStatus: networkInfo.isOnline,
      });

      logger.authEvent('API Request Started', {
        url: config.url,
        method: config.method,
        requestId,
        hasToken: !!token,
        networkInfo,
      });
    } else {
      logger.networkRequest({
        url: `${config.baseURL}${config.url}`,
        method: config.method?.toUpperCase() || 'GET',
        requestId,
        userAgent: navigator.userAgent,
      });
    }

    return config;
  },
  (error) => {
    logger.error('Request interceptor error', {
      error: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors and logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config;
    const duration = config.metadata?.startTime ? Date.now() - config.metadata.startTime : undefined;
    
    logger.networkResponse({
      url: response.config.url || '',
      method: response.config.method?.toUpperCase() || 'GET',
      status: response.status,
      duration,
      requestId: config.metadata?.requestId,
    });

    if (config.url?.includes('/auth/')) {
      logger.authEvent('API Response Success', {
        url: config.url,
        status: response.status,
        duration,
        requestId: config.metadata?.requestId,
        responseSize: JSON.stringify(response.data).length,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const config = error.config;
    const duration = config?.metadata?.startTime ? Date.now() - config.metadata.startTime : undefined;
    
    // Enhanced error logging
    const errorContext = {
      url: config?.url || 'unknown',
      method: config?.method?.toUpperCase() || 'unknown',
      status: error.response?.status,
      duration,
      requestId: config?.metadata?.requestId,
      errorCode: error.code,
      errorMessage: error.message,
      responseData: error.response?.data,
    };

    logger.networkResponse({
      url: config?.url || '',
      method: config?.method?.toUpperCase() || 'GET',
      status: error.response?.status || 0,
      duration,
      requestId: config?.metadata?.requestId,
    });

    // Special handling for auth errors
    if (config?.url?.includes('/auth/')) {
      logger.authEvent('API Response Error', errorContext);
      
      // Network diagnostics on auth failures
      if (!error.response || error.code === 'NETWORK_ERROR') {
        logger.error('Network error detected, running diagnostics', errorContext);
        
        try {
          const diagnostics = await NetworkUtils.diagnoseNetworkIssue();
          logger.error('Network diagnostics results', {
            ...errorContext,
            diagnostics,
          });
        } catch (diagError) {
          logger.error('Failed to run network diagnostics', {
            ...errorContext,
            diagError: diagError instanceof Error ? diagError.message : 'Unknown error',
          });
        }
      }
    }

    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401) {
      logger.authEvent('Token expired or invalid', {
        requestId: config?.metadata?.requestId,
      });
      
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
      logger.warn('Rate limit exceeded', errorContext);
      return Promise.reject(new Error(message));
    }

    // Handle service worker conflicts
    if (error.message.includes('Failed to fetch')) {
      logger.error('Fetch failed - possible service worker conflict', {
        ...errorContext,
        serviceWorkerRegistrations: await (async () => {
          try {
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              return registrations.map(reg => ({
                scope: reg.scope,
                state: reg.active?.state,
              }));
            }
            return [];
          } catch {
            return 'failed-to-get-sw-info';
          }
        })(),
      });
    }

    // Extract error message
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    logger.error('API request failed', {
      ...errorContext,
      finalMessage: message,
    });

    return Promise.reject(new Error(message));
  }
);

// Helper function to handle API responses with logging
export const handleApiResponse = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data.success) {
    logger.error('API response indicates failure', {
      success: response.data.success,
      message: response.data.message,
      timestamp: response.data.timestamp,
    });
    throw new Error(response.data.message);
  }
  
  logger.debug('API response success', {
    message: response.data.message,
    timestamp: response.data.timestamp,
    hasData: !!response.data.data,
  });

  return response.data.data as T;
};

// Helper function to handle API errors with enhanced logging
export const handleApiError = (error: any): never => {
  const errorContext = {
    hasResponse: !!error.response,
    hasResponseData: !!error.response?.data,
    status: error.response?.status,
    errorCode: error.code,
    errorMessage: error.message,
  };

  if (error.response?.data?.errors) {
    // Validation errors
    const validationErrors = error.response.data.errors as Array<{field: string, message: string}>;
    const firstError = validationErrors[0];
    
    logger.error('API validation error', {
      ...errorContext,
      validationErrors,
      firstError: firstError.message,
    });
    
    throw new Error(firstError.message);
  }
  
  if (error.response?.data?.message) {
    logger.error('API error with message', {
      ...errorContext,
      apiMessage: error.response.data.message,
    });
    throw new Error(error.response.data.message);
  }
  
  logger.error('Generic API error', errorContext);
  throw new Error(error.message || 'An unexpected error occurred');
};

// Add request config metadata type
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      requestId: string;
      startTime: number;
    };
  }
}

export default api;