"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authService, type User, type LoginData, type RegisterData, type AuthState } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { useToast } from '@/components/ui/use-toast'
import type { UpdateProfileFormData } from '@/utils/validation'

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateProfile: (data: Partial<UpdateProfileFormData>) => Promise<void>
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>
  deleteAccount: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Initialize auth state
  useEffect(() => {
    logger.info('Auth context initialization started')
    
    try {
      const currentUser = authService.getCurrentUser()
      const isAuthenticated = authService.isAuthenticated()
      
      setState({
        user: currentUser,
        isAuthenticated,
        isLoading: false,
      })

      logger.info('Auth context initialized', {
        hasUser: !!currentUser,
        isAuthenticated,
        userId: currentUser?.id,
        username: currentUser?.username,
      })
    } catch (error) {
      logger.error('Failed to initialize auth context', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  const login = async (data: LoginData) => {
    logger.authEvent('Context: Login started', { username: data.username })
    setState((prev) => ({ ...prev, isLoading: true }))
    
    try {
      const user = await authService.login(data)
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      
      logger.authEvent('Context: Login successful', {
        userId: user.id,
        username: user.username,
      })
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${user.name}!`,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login"
      
      logger.authEvent('Context: Login failed', {
        username: data.username,
        error: errorMessage,
      })
      
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: errorMessage,
      })
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    logger.authEvent('Context: Registration started', {
      username: data.username,
      email: data.email,
      name: data.name,
    })
    
    setState((prev) => ({ ...prev, isLoading: true }))
    
    try {
      const user = await authService.register(data)
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      
      logger.authEvent('Context: Registration successful', {
        userId: user.id,
        username: user.username,
      })
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo ao StreamHive, ${user.name}!`,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta"
      
      logger.authEvent('Context: Registration failed', {
        username: data.username,
        email: data.email,
        error: errorMessage,
      })
      
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: errorMessage,
      })
      throw error
    }
  }

  const updateProfile = async (data: Partial<UpdateProfileFormData>) => {
    logger.authEvent('Context: Profile update started', {
      fieldsToUpdate: Object.keys(data),
      userId: state.user?.id,
    })
    
    try {
      const updatedUser = await authService.updateProfile(data)
      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }))
      
      logger.authEvent('Context: Profile update successful', {
        userId: updatedUser.id,
        updatedFields: Object.keys(data),
      })
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar perfil"
      
      logger.authEvent('Context: Profile update failed', {
        fieldsToUpdate: Object.keys(data),
        userId: state.user?.id,
        error: errorMessage,
      })
      
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: errorMessage,
      })
      throw error
    }
  }

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    logger.authEvent('Context: Password change started', {
      userId: state.user?.id,
    })
    
    try {
      await authService.changePassword(data)
      
      logger.authEvent('Context: Password change successful', {
        userId: state.user?.id,
      })
      
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao alterar senha"
      
      logger.authEvent('Context: Password change failed', {
        userId: state.user?.id,
        error: errorMessage,
      })
      
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: errorMessage,
      })
      throw error
    }
  }

  const deleteAccount = async () => {
    logger.authEvent('Context: Account deletion started', {
      userId: state.user?.id,
    })
    
    try {
      await authService.deleteAccount()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      
      logger.authEvent('Context: Account deletion successful')
      
      toast({
        title: "Conta deletada",
        description: "Sua conta foi removida com sucesso.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar conta"
      
      logger.authEvent('Context: Account deletion failed', {
        userId: state.user?.id,
        error: errorMessage,
      })
      
      toast({
        variant: "destructive",
        title: "Erro ao deletar conta",
        description: errorMessage,
      })
      throw error
    }
  }

  const logout = async () => {
    logger.authEvent('Context: Logout started', {
      userId: state.user?.id,
    })
    
    try {
      await authService.logout()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      
      logger.authEvent('Context: Logout successful')
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      })
    } catch (error) {
      logger.authEvent('Context: Logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      // Even if logout fails, clear the local state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      
      toast({
        variant: "destructive",
        title: "Erro no logout",
        description: "Houve um problema ao fazer logout, mas você foi desconectado localmente.",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        updateProfile,
        changePassword,
        deleteAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}