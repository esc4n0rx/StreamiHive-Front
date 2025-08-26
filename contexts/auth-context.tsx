"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService, type LoginData, type RegisterData, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
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
    const currentUser = authService.getCurrentUser()
    setState({
      user: currentUser,
      isAuthenticated: !!currentUser,
      isLoading: false,
    })
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
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
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
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
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
  }

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
