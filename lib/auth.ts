import { authApiService } from './auth-api';
import type { ApiUser } from '@/types/api.types';
import type { LoginFormData, RegisterFormData, UpdateProfileFormData, ChangePasswordFormData } from '@/utils/validation';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  birthDate: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  birthDate: string;
  password: string;
  bio?: string;
}

// Transform ApiUser to User
const transformApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  username: apiUser.username,
  birthDate: apiUser.birthDate,
  avatarUrl: apiUser.avatarUrl,
  bio: apiUser.bio,
  createdAt: apiUser.createdAt,
  updatedAt: apiUser.updatedAt,
});

// Updated auth service using API
export const authService = {
  async login(data: LoginData): Promise<User> {
    try {
      const response = await authApiService.login({
        username: data.username,
        password: data.password,
      });
      return transformApiUser(response.user);
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await authApiService.register({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        bio: data.bio,
      });
      return transformApiUser(response.user);
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(data: Partial<UpdateProfileFormData>): Promise<User> {
    try {
      const response = await authApiService.updateProfile(data);
      return transformApiUser(response);
    } catch (error) {
      throw error;
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await authApiService.changePassword(data);
    } catch (error) {
      throw error;
    }
  },

  async deleteAccount(): Promise<void> {
    try {
      await authApiService.deleteAccount();
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    await authApiService.logout();
  },

  getCurrentUser(): User | null {
    const apiUser = authApiService.getCurrentUser();
    return apiUser ? transformApiUser(apiUser) : null;
  },

  isAuthenticated(): boolean {
    return authApiService.isAuthenticated();
  },

  async refreshProfile(): Promise<User> {
    try {
      const response = await authApiService.getProfile();
      return transformApiUser(response);
    } catch (error) {
      throw error;
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      await authApiService.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  },
};