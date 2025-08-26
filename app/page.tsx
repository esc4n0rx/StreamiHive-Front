"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { AuthGuard } from "@/components/auth/auth-guard"
import { FadeIn, SlideUp } from "@/components/ui/motion-wrapper"
import { Play, Users, Shield, Smartphone, MessageCircle, Star, Mail, HelpCircle, ArrowRight, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null)

  const features = [
    {
      icon: Play,
      title: "Streaming Colaborativo",
      description: "Assista vídeos junto com seus amigos em tempo real, sincronizado perfeitamente.",
    },
    {
      icon: Users,
      title: "Salas Personalizadas",
      description: "Crie salas privadas ou públicas com controles avançados de moderação.",
    },
    {
      icon: MessageCircle,
      title: "Chat em Tempo Real",
      description: "Converse com outros usuários durante a transmissão com nosso chat integrado.",
    },
    {
      icon: Shield,
      title: "Controle de Idade",
      description: "Filtros por faixa etária para garantir conteúdo apropriado para cada público.",
    },
    {
      icon: Smartphone,
      title: "PWA Responsivo",
      description: "Funciona perfeitamente em desktop, tablet e mobile. Instale como app nativo.",
    },
    {
      icon: Zap,
      title: "Performance Otimizada",
      description: "Streaming de alta qualidade com baixa latência e sincronização perfeita.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 streamhive-gradient opacity-90" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <FadeIn>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Stream<span className="text-accent">Hive</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                A plataforma definitiva para streaming colaborativo estilo Rave.
                <br />
                Assista, converse e compartilhe momentos únicos com seus amigos.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="streamhive-button-accent text-lg px-8 py-6"
                  onClick={() => setAuthMode("register")}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => setAuthMode("login")}
                >
                  Já tenho conta
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SlideUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher o StreamHive?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Recursos inovadores para uma experiência de streaming colaborativo única
              </p>
            </div>
          </SlideUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <SlideUp key={feature.title} delay={index * 0.1}>
                <Card className="streamhive-card h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-accent/10 rounded-lg mr-4">
                        <feature.icon className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <SlideUp>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">1000+</div>
                <p className="text-lg text-muted-foreground">Usuários Ativos</p>
              </div>
            </SlideUp>
            <SlideUp delay={0.1}>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">500+</div>
                <p className="text-lg text-muted-foreground">Salas Criadas</p>
              </div>
            </SlideUp>
            <SlideUp delay={0.2}>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">24/7</div>
                <p className="text-lg text-muted-foreground">Suporte Online</p>
              </div>
            </SlideUp>
          </div>
        </div>
      </section>

      {/* Support & Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SlideUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Precisa de ajuda?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Nossa equipe está sempre pronta para ajudar você
              </p>
            </div>
          </SlideUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <SlideUp>
              <Card className="streamhive-card">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-accent/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <HelpCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Central de Ajuda</h3>
                  <p className="text-muted-foreground mb-6">
                    Encontre respostas para as perguntas mais frequentes e tutoriais detalhados.
                  </p>
                  <Button className="streamhive-button-accent">Acessar FAQ</Button>
                </CardContent>
              </Card>
            </SlideUp>

            <SlideUp delay={0.1}>
              <Card className="streamhive-card">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-accent/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Contato Direto</h3>
                  <p className="text-muted-foreground mb-6">
                    Entre em contato conosco diretamente para suporte personalizado.
                  </p>
                  <Button className="streamhive-button-accent">Enviar Mensagem</Button>
                </CardContent>
              </Card>
            </SlideUp>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <SlideUp>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar sua jornada?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já estão aproveitando o melhor do streaming colaborativo.
            </p>
            <Button
              size="lg"
              className="streamhive-button-accent text-lg px-8 py-6"
              onClick={() => setAuthMode("register")}
            >
              Criar Conta Gratuita
              <Star className="ml-2 h-5 w-5" />
            </Button>
          </SlideUp>
        </div>
      </section>

      {/* Auth Modal */}
      <AnimatePresence>
        {authMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAuthMode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {authMode === "login" ? (
                <LoginForm onToggleMode={() => setAuthMode("register")} />
              ) : (
                <RegisterForm onToggleMode={() => setAuthMode("login")} />
              )}
              <Button
                variant="ghost"
                className="w-full mt-4 text-white hover:bg-white/10"
                onClick={() => setAuthMode(null)}
              >
                Fechar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <FadeIn>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao StreamHive!</h1>
          <p className="text-xl text-muted-foreground mb-8">Redirecionando para o dashboard...</p>
          <div className="animate-pulse">
            <div className="h-2 bg-accent rounded-full w-64 mx-auto"></div>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard fallback={<LandingPage />}>
      <DashboardRedirect />
    </AuthGuard>
  )
}
