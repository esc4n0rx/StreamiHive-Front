"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { CreateRoomModal } from "@/components/rooms/create-room-modal"
import { JoinRoomModal } from "@/components/rooms/join-room-modal"
import { FadeIn, SlideUp } from "@/components/ui/motion-wrapper"
import { useAuth } from "@/contexts/auth-context"
import {
  roomService,
  initializeSampleRooms,
  type Room,
  type RoomFilters,
  roomCategories,
  ageRatings,
} from "@/lib/rooms"
import { Search, Plus, Users, Lock, Play, Filter, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<RoomFilters>({ category: "all", ageRating: "all", streamType: "all" })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    initializeSampleRooms()
    loadRooms()
  }, [])

  useEffect(() => {
    loadRooms()
  }, [filters])

  const loadRooms = async () => {
    setLoading(true)
    try {
      const roomsData = await roomService.getRooms(filters)
      setRooms(roomsData)
    } catch (error) {
      console.error("Erro ao carregar salas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = (room: Room) => {
    setSelectedRoom(room)
    if (room.password) {
      setShowJoinModal(true)
    } else {
      // Direct join for public rooms without password
      joinRoom(room.id)
    }
  }

  const joinRoom = async (roomId: string, password?: string) => {
    try {
      await roomService.joinRoom(roomId, password)
      // Navigate to room
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error("Erro ao entrar na sala:", error)
    }
  }

  const handleFilterChange = (key: keyof RoomFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value || undefined,
    }))
  }

  const clearFilters = () => {
    setFilters({ category: "all", ageRating: "all", streamType: "all" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Salas de Streaming</h1>
              <p className="text-muted-foreground">Encontre salas para assistir junto com outros usuários</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="streamhive-button-accent" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Criar Sala
            </Button>
          </div>
        </FadeIn>

        {/* Filters */}
        <SlideUp delay={0.1}>
          <Card className="streamhive-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome da sala..."
                      value={filters.search || ""}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {roomCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Faixa Etária</label>
                  <Select value={filters.ageRating} onValueChange={(value) => handleFilterChange("ageRating", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {ageRatings.map((rating) => (
                        <SelectItem key={rating.value} value={rating.value}>
                          {rating.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={filters.streamType} onValueChange={(value) => handleFilterChange("streamType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="external">Link Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {Object.values(filters).some((value) => value !== "all") && (
                <div className="mt-4">
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideUp>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => (
              <SlideUp key={room.id} delay={index * 0.1}>
                <Card className="streamhive-card h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-1">{room.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{room.description}</CardDescription>
                      </div>
                      {room.password && <Lock className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{room.category}</Badge>
                        <Badge variant="outline">{room.ageRating}</Badge>
                        <Badge variant="outline">{room.streamType === "youtube" ? "YouTube" : "Externo"}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {room.currentParticipants}/{room.maxParticipants}
                        </div>
                        <div>Host: {room.hostName}</div>
                      </div>

                      <Button
                        onClick={() => handleJoinRoom(room)}
                        className="w-full streamhive-button-accent"
                        disabled={room.currentParticipants >= room.maxParticipants}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {room.currentParticipants >= room.maxParticipants ? "Sala Lotada" : "Entrar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">Nenhuma sala encontrada com os filtros aplicados</p>
            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        )}
      </main>

      <CreateRoomModal open={showCreateModal} onOpenChange={setShowCreateModal} onRoomCreated={loadRooms} />

      <JoinRoomModal open={showJoinModal} onOpenChange={setShowJoinModal} room={selectedRoom} onJoin={joinRoom} />
    </div>
  )
}
