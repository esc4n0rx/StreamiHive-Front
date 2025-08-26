"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { registerSchema, type RegisterFormData } from "@/utils/validation"
import { Eye, EyeOff, Mail, Lock, User, Calendar, AtSign, FileText } from "lucide-react"

interface RegisterFormProps {
  onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const { register, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Validate on change to show real-time validation
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      bio: "",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        bio: data.bio || undefined, // Convert empty string to undefined
      })
    } catch (error) {
      // Error is handled in the context
    }
  }

  // Watch form values for validation
  const watchedValues = form.watch()
  const bioLength = watchedValues.bio?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="streamhive-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Registrar</CardTitle>
          <CardDescription>Crie sua conta para começar a usar o StreamHive</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    className="pl-10"
                    {...form.register("name")}
                    aria-invalid={!!form.formState.errors.name}
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Usuário <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="seuusuario"
                    className="pl-10"
                    {...form.register("username")}
                    aria-invalid={!!form.formState.errors.username}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...form.register("email")}
                  aria-invalid={!!form.formState.errors.email}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">
                Data de Nascimento <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="birthDate"
                  type="date"
                  className="pl-10"
                  {...form.register("birthDate")}
                  aria-invalid={!!form.formState.errors.birthDate}
                />
              </div>
              {form.formState.errors.birthDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.birthDate.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    className="pl-10 pr-10"
                    {...form.register("password")}
                    aria-invalid={!!form.formState.errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
                {!form.formState.errors.password && watchedValues.password && (
                  <p className="text-xs text-muted-foreground">
                    Deve conter maiúsculas, minúsculas, números e símbolos
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmar Senha <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    className="pl-10 pr-10"
                    {...form.register("confirmPassword")}
                    aria-invalid={!!form.formState.errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio (opcional)
              </Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                rows={3}
                {...form.register("bio")}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {bioLength}/500 caracteres
                </p>
                {bioLength > 450 && (
                  <p className="text-xs text-amber-500">
                    Limite quase atingido
                  </p>
                )}
              </div>
              {form.formState.errors.bio && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full streamhive-button-accent" 
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <button 
                type="button" 
                onClick={onToggleMode} 
                className="text-accent hover:text-accent/80 font-medium"
                disabled={isLoading}
              >
                Entrar
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}