// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    timestamp: string;
  }
  
  export interface ApiError {
    success: false;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
    timestamp: string;
  }
  
  // User Types
  export interface ApiUser {
    id: string;
    name: string;
    username: string;
    email: string;
    birthDate: string;
    avatarUrl?: string;
    bio?: string;
    createdAt: string;
    updatedAt?: string;
  }
  
  // Authentication Types
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface RegisterRequest {
    name: string;
    username: string;
    email: string;
    password: string;
    birthDate: string;
    bio?: string;
  }
  
  export interface AuthResponse {
    user: ApiUser;
    token: string;
  }
  
  export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    birthDate?: string;
    avatarUrl?: string;
    bio?: string;
  }
  
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
  }
  
  // Health Check
  export interface HealthResponse {
    success: boolean;
    message: string;
    timestamp: string;
    environment: 'development' | 'production';
  }