export interface User {
  id: string
  name: string
  email: string
  username: string
  birthDate: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  username: string
  birthDate: string
  password: string
  confirmPassword: string
}

// Simulate API calls with localStorage
export const authService = {
  async login(data: LoginData): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const users = JSON.parse(localStorage.getItem("streamhive_users") || "[]")
    const user = users.find((u: User & { password: string }) => u.email === data.email && u.password === data.password)

    if (!user) {
      throw new Error("Credenciais inválidas")
    }

    const { password, ...userWithoutPassword } = user
    localStorage.setItem("streamhive_current_user", JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  },

  async register(data: RegisterData): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const users = JSON.parse(localStorage.getItem("streamhive_users") || "[]")

    // Check if email or username already exists
    const existingUser = users.find((u: User) => u.email === data.email || u.username === data.username)

    if (existingUser) {
      throw new Error("Email ou usuário já existe")
    }

    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      username: data.username,
      birthDate: data.birthDate,
      password: data.password,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("streamhive_users", JSON.stringify(users))

    const { password, ...userWithoutPassword } = newUser
    localStorage.setItem("streamhive_current_user", JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  },

  async logout(): Promise<void> {
    localStorage.removeItem("streamhive_current_user")
  },

  getCurrentUser(): User | null {
    const userData = localStorage.getItem("streamhive_current_user")
    return userData ? JSON.parse(userData) : null
  },
}
