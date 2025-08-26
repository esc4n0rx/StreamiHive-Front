"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService, type LoginData, type RegisterData, type AuthState, type User } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import type { UpdateProfileFormData, ChangePasswordFormData } from "@/utils/validation"

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateProfile: (data: Partial<UpdateProfileFormData>) => Promise<void>
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>
  deleteAccount: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser()
          if (currentUser) {
            // Try to refresh profile from server
            try {
              const refreshedUser = await authService.refreshProfile()
              setState({
                user: refreshedUser,
                isAuthenticated: true,
                isLoading: false,
              })
            } catch (error) {
              // If refresh fails, use cached user data
              setState({
                user: currentUser,
                isAuthenticated: true,
                isLoading: false,
              })
            }
          } else {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    initAuth()
  }, [])

  const login = async (data: LoginData) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.login(data)
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${user.name}!`,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro ao fazer login",
      })
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.register(data)
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo ao StreamHive, ${user.name}!`,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
      })
      throw error
    }
  }

  const updateProfile = async (data: Partial<UpdateProfileFormData>) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }))
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil",
      })
      throw error
    }
  }

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await authService.changePassword(data)
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Erro ao alterar senha",
      })
      throw error
    }
  }

  const deleteAccount = async () => {
    try {
      await authService.deleteAccount()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      toast({
        title: "Conta deletada",
        description: "Sua conta foi removida com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar conta",
        description: error instanceof Error ? error.message : "Erro ao deletar conta",
      })
      throw error
    }
  }

  const refreshProfile = async () => {
    try {
      const refreshedUser = await authService.refreshProfile()
      setState((prev) => ({
        ...prev,
        user: refreshedUser,
      }))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar dados",
        description: "Não foi possível sincronizar seus dados.",
      })
      throw error
    }
  }

  const logout = async () => {
    await authService.logout()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    })
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
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}