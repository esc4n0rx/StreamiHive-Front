import api, { handleApiResponse, handleApiError } from './api';
import { logger } from './logger';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiUser, 
  UpdateProfileRequest, 
  ChangePasswordRequest,
  HealthResponse 
} from '@/types/api.types';

export const authApiService = {
  // Health check with enhanced logging
  async healthCheck(): Promise<HealthResponse> {
    logger.info('Health check started');
    try {
      const response = await api.get('/health');
      const result = handleApiResponse(response);
      logger.info('Health check successful', {
        environment: result.environment,
        message: result.message,
      });
      return result;
    } catch (error) {
      logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw handleApiError(error); 
    }
  },

  // Authentication with detailed logging
  async login(data: LoginRequest): Promise<AuthResponse> {
    logger.authEvent('Login attempt started', {
      username: data.username,
      hasPassword: !!data.password,
      passwordLength: data.password.length,
    });

    try {
      const response = await api.post('/api/v1/auth/login', data);
      const authData = handleApiResponse<AuthResponse>(response);
      
      // Store token and user data
      localStorage.setItem('streamhive_token', authData.token);
      localStorage.setItem('streamhive_current_user', JSON.stringify(authData.user));
      
      logger.authEvent('Login successful', {
        userId: authData.user.id,
        username: authData.user.username,
        tokenLength: authData.token.length,
      });
      
      return authData;
    } catch (error) {
      logger.authEvent('Login failed', {
        username: data.username,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw handleApiError(error); 
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    logger.authEvent('Registration attempt started', {
      username: data.username,
      email: data.email,
      name: data.name,
      hasPassword: !!data.password,
      passwordLength: data.password.length,
      hasBio: !!data.bio,
      birthDate: data.birthDate,
    });

    try {
      const response = await api.post('/api/v1/auth/register', data);
      const authData = handleApiResponse<AuthResponse>(response);
      
      // Store token and user data
      localStorage.setItem('streamhive_token', authData.token);
      localStorage.setItem('streamhive_current_user', JSON.stringify(authData.user));
      
      logger.authEvent('Registration successful', {
        userId: authData.user.id,
        username: authData.user.username,
        tokenLength: authData.token.length,
      });
      
      return authData;
    } catch (error) {
      logger.authEvent('Registration failed', {
        username: data.username,
        email: data.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw handleApiError(error); 
    }
  },

  // Profile management
  async getProfile(): Promise<ApiUser> {
    logger.authEvent('Profile fetch started');
    try {
      const response = await api.get('/api/v1/auth/profile');
      const user = handleApiResponse<ApiUser>(response);
      
      // Update stored user data
      localStorage.setItem('streamhive_current_user', JSON.stringify(user));
      
      logger.authEvent('Profile fetch successful', {
        userId: user.id,
        username: user.username,
      });
      
      return user;
    } catch (error) {
      logger.authEvent('Profile fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw handleApiError(error); 
    }
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ApiUser> {
    logger.authEvent('Profile update started', {
      fieldsToUpdate: Object.keys(data),
    });

    try {
      const response = await api.put('/api/v1/auth/profile', data);
      const user = handleApiResponse<ApiUser>(response);
      
      // Update stored user data
      localStorage.setItem('streamhive_current_user', JSON.stringify(user));
      
      logger.authEvent('Profile update successful', {
        userId: user.id,
        updatedFields: Object.keys(data),
      });
      
      return user;
    } catch (error) {
      logger.authEvent('Profile update failed', {
        fieldsToUpdate: Object.keys(data),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw handleApiError(error); 
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    logger.authEvent('Password change started', {
      hasCurrentPassword: !!data.currentPassword,
      hasNewPassword: !!data.newPassword,
      newPasswordLength: data.newPassword.length,
    });

    try {
      const response = await api.put('/api/v1/auth/change-password', data);
      handleApiResponse(response);
      
      logger.authEvent('Password change successful');
    } catch (error) {
      logger.authEvent('Password change failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      handleApiError(error);
    }
  },

  async deleteAccount(): Promise<void> {
    logger.authEvent('Account deletion started');

    try {
      const response = await api.delete('/api/v1/auth/account');
      handleApiResponse(response);
      
      // Clear stored data
      localStorage.removeItem('streamhive_token');
      localStorage.removeItem('streamhive_current_user');
      
      logger.authEvent('Account deletion successful');
    } catch (error) {
      logger.authEvent('Account deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      handleApiError(error);
    }
  },

  // Logout (client-side only)
  async logout(): Promise<void> {
    logger.authEvent('Logout started');
    
    localStorage.removeItem('streamhive_token');
    localStorage.removeItem('streamhive_current_user');
    
    logger.authEvent('Logout completed');
  },

  // Get current user from storage
  getCurrentUser(): ApiUser | null {
    try {
      const userData = localStorage.getItem('streamhive_current_user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (user) {
        logger.debug('Current user retrieved from storage', {
          userId: user.id,
          username: user.username,
        });
      } else {
        logger.debug('No current user in storage');
      }
      
      return user;
    } catch (error) {
      logger.error('Failed to get current user from storage', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('streamhive_token');
    const user = this.getCurrentUser();
    const isAuth = !!(token && user);
    
    logger.debug('Authentication status checked', {
      hasToken: !!token,
      hasUser: !!user,
      isAuthenticated: isAuth,
    });
    
    return isAuth;
  }
};