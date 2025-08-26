import api, { handleApiResponse, handleApiError } from './api';
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
  // Health check
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await api.get('/health');
      return handleApiResponse(response);
    } catch (error) {
        throw handleApiError(error); 
    }
  },

  // Authentication
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/v1/auth/login', data);
      const authData = handleApiResponse<AuthResponse>(response);
      
      // Store token and user data
      localStorage.setItem('streamhive_token', authData.token);
      localStorage.setItem('streamhive_current_user', JSON.stringify(authData.user));
      
      return authData;
    } catch (error) {
        throw handleApiError(error); 
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/v1/auth/register', data);
      const authData = handleApiResponse<AuthResponse>(response);
      
      // Store token and user data
      localStorage.setItem('streamhive_token', authData.token);
      localStorage.setItem('streamhive_current_user', JSON.stringify(authData.user));
      
      return authData;
    } catch (error) {
        throw handleApiError(error); 
    }
  },

  // Profile management
  async getProfile(): Promise<ApiUser> {
    try {
      const response = await api.get('/api/v1/auth/profile');
      const user = handleApiResponse<ApiUser>(response);
      
      // Update stored user data
      localStorage.setItem('streamhive_current_user', JSON.stringify(user));
      
      return user;
    } catch (error) {
        throw handleApiError(error); 
    }
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ApiUser> {
    try {
      const response = await api.put('/api/v1/auth/profile', data);
      const user = handleApiResponse<ApiUser>(response);
      
      // Update stored user data
      localStorage.setItem('streamhive_current_user', JSON.stringify(user));
      
      return user;
    } catch (error) {
        throw handleApiError(error); 
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await api.put('/api/v1/auth/change-password', data);
      handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteAccount(): Promise<void> {
    try {
      const response = await api.delete('/api/v1/auth/account');
      handleApiResponse(response);
      
      // Clear stored data
      localStorage.removeItem('streamhive_token');
      localStorage.removeItem('streamhive_current_user');
    } catch (error) {
      handleApiError(error);
    }
  },

  // Logout (client-side only)
  async logout(): Promise<void> {
    localStorage.removeItem('streamhive_token');
    localStorage.removeItem('streamhive_current_user');
  },

  // Get current user from storage
  getCurrentUser(): ApiUser | null {
    try {
      const userData = localStorage.getItem('streamhive_current_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('streamhive_token');
    const user = this.getCurrentUser();
    return !!(token && user);
  }
};