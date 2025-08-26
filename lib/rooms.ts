export interface Room {
  id: string
  name: string
  description: string
  hostId: string
  hostName: string
  category: string
  ageRating: "livre" | "10+" | "12+" | "14+" | "16+" | "18+"
  streamType: "youtube" | "external"
  streamUrl: string
  password?: string
  maxParticipants: number
  currentParticipants: number
  isPublic: boolean
  createdAt: string
  isActive: boolean
}

export interface CreateRoomData {
  name: string
  description: string
  category: string
  ageRating: "livre" | "10+" | "12+" | "14+" | "16+" | "18+"
  streamType: "youtube" | "external"
  streamUrl: string
  password?: string
  maxParticipants: number
  isPublic: boolean
}

export interface RoomFilters {
  category?: string
  ageRating?: string
  streamType?: string
  search?: string
}

export const roomCategories = [
  "Música",
  "Filmes",
  "Séries",
  "Jogos",
  "Esportes",
  "Educativo",
  "Entretenimento",
  "Outros",
]

export const ageRatings = [
  { value: "livre", label: "Livre" },
  { value: "10+", label: "10+" },
  { value: "12+", label: "12+" },
  { value: "14+", label: "14+" },
  { value: "16+", label: "16+" },
  { value: "18+", label: "18+" },
]

// Simulate API calls with localStorage
export const roomService = {
  async getRooms(filters?: RoomFilters): Promise<Room[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const rooms: Room[] = JSON.parse(localStorage.getItem("streamhive_rooms") || "[]")

    let filteredRooms = rooms.filter((room) => room.isActive && room.isPublic)

    if (filters) {
      if (filters.category) {
        filteredRooms = filteredRooms.filter((room) => room.category === filters.category)
      }
      if (filters.ageRating) {
        filteredRooms = filteredRooms.filter((room) => room.ageRating === filters.ageRating)
      }
      if (filters.streamType) {
        filteredRooms = filteredRooms.filter((room) => room.streamType === filters.streamType)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredRooms = filteredRooms.filter(
          (room) =>
            room.name.toLowerCase().includes(searchLower) || room.description.toLowerCase().includes(searchLower),
        )
      }
    }

    return filteredRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async createRoom(data: CreateRoomData, hostId: string, hostName: string): Promise<Room> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const rooms: Room[] = JSON.parse(localStorage.getItem("streamhive_rooms") || "[]")

    const newRoom: Room = {
      id: Date.now().toString(),
      ...data,
      hostId,
      hostName,
      currentParticipants: 1,
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    rooms.push(newRoom)
    localStorage.setItem("streamhive_rooms", JSON.stringify(rooms))

    return newRoom
  },

  async joinRoom(roomId: string, password?: string): Promise<Room> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const rooms: Room[] = JSON.parse(localStorage.getItem("streamhive_rooms") || "[]")
    const room = rooms.find((r) => r.id === roomId)

    if (!room) {
      throw new Error("Sala não encontrada")
    }

    if (!room.isActive) {
      throw new Error("Sala não está ativa")
    }

    if (room.password && room.password !== password) {
      throw new Error("Senha incorreta")
    }

    if (room.currentParticipants >= room.maxParticipants) {
      throw new Error("Sala lotada")
    }

    // Update participant count
    room.currentParticipants += 1
    localStorage.setItem("streamhive_rooms", JSON.stringify(rooms))

    return room
  },

  async getUserRooms(userId: string): Promise<Room[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const rooms: Room[] = JSON.parse(localStorage.getItem("streamhive_rooms") || "[]")
    return rooms.filter((room) => room.hostId === userId)
  },
}

// Initialize with some sample rooms
export const initializeSampleRooms = () => {
  const existingRooms = localStorage.getItem("streamhive_rooms")
  if (!existingRooms) {
    const sampleRooms: Room[] = [
      {
        id: "1",
        name: "Noite de Filmes Clássicos",
        description: "Assistindo aos melhores filmes dos anos 80 e 90",
        hostId: "sample1",
        hostName: "CinemaLover",
        category: "Filmes",
        ageRating: "12+",
        streamType: "youtube",
        streamUrl: "https://youtube.com/watch?v=example1",
        maxParticipants: 50,
        currentParticipants: 23,
        isPublic: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isActive: true,
      },
      {
        id: "2",
        name: "Live Music Session",
        description: "Descobrindo novos artistas indie e rock alternativo",
        hostId: "sample2",
        hostName: "MusicExplorer",
        category: "Música",
        ageRating: "livre",
        streamType: "external",
        streamUrl: "https://example.com/stream",
        maxParticipants: 100,
        currentParticipants: 67,
        isPublic: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isActive: true,
      },
      {
        id: "3",
        name: "Maratona de Séries",
        description: "Assistindo a temporada completa de uma série mistério",
        hostId: "sample3",
        hostName: "SeriesFan",
        category: "Séries",
        ageRating: "16+",
        streamType: "youtube",
        streamUrl: "https://youtube.com/watch?v=example3",
        password: "123456",
        maxParticipants: 25,
        currentParticipants: 12,
        isPublic: true,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        isActive: true,
      },
    ]
    localStorage.setItem("streamhive_rooms", JSON.stringify(sampleRooms))
  }
}
