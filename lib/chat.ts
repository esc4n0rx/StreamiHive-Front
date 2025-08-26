export interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: string
  type: "message" | "system" | "join" | "leave"
}

export interface Participant {
  id: string
  username: string
  name: string
  joinedAt: string
  isHost: boolean
  isOnline: boolean
}

// Simulate real-time chat with localStorage and events
export class ChatService {
  private roomId: string
  private userId: string
  private username: string
  private listeners: ((messages: ChatMessage[]) => void)[] = []
  private participantListeners: ((participants: Participant[]) => void)[] = []

  constructor(roomId: string, userId: string, username: string) {
    this.roomId = roomId
    this.userId = userId
    this.username = username

    // Listen for storage changes to simulate real-time updates
    window.addEventListener("storage", this.handleStorageChange.bind(this))
  }

  private handleStorageChange(e: StorageEvent) {
    if (e.key === `streamhive_chat_${this.roomId}`) {
      const messages = this.getMessages()
      this.listeners.forEach((listener) => listener(messages))
    }
    if (e.key === `streamhive_participants_${this.roomId}`) {
      const participants = this.getParticipants()
      this.participantListeners.forEach((listener) => listener(participants))
    }
  }

  onMessagesUpdate(callback: (messages: ChatMessage[]) => void) {
    this.listeners.push(callback)
    // Send initial messages
    callback(this.getMessages())
  }

  onParticipantsUpdate(callback: (participants: Participant[]) => void) {
    this.participantListeners.push(callback)
    // Send initial participants
    callback(this.getParticipants())
  }

  sendMessage(message: string) {
    const messages = this.getMessages()
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: this.userId,
      username: this.username,
      message,
      timestamp: new Date().toISOString(),
      type: "message",
    }

    messages.push(newMessage)
    localStorage.setItem(`streamhive_chat_${this.roomId}`, JSON.stringify(messages))

    // Trigger storage event manually for same-tab updates
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `streamhive_chat_${this.roomId}`,
        newValue: JSON.stringify(messages),
      }),
    )
  }

  sendSystemMessage(message: string) {
    const messages = this.getMessages()
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "Sistema",
      message,
      timestamp: new Date().toISOString(),
      type: "system",
    }

    messages.push(systemMessage)
    localStorage.setItem(`streamhive_chat_${this.roomId}`, JSON.stringify(messages))

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `streamhive_chat_${this.roomId}`,
        newValue: JSON.stringify(messages),
      }),
    )
  }

  joinRoom(participant: Participant) {
    const participants = this.getParticipants()
    const existingIndex = participants.findIndex((p) => p.id === participant.id)

    if (existingIndex >= 0) {
      participants[existingIndex] = { ...participant, isOnline: true }
    } else {
      participants.push(participant)
    }

    localStorage.setItem(`streamhive_participants_${this.roomId}`, JSON.stringify(participants))

    // Send join message
    this.sendSystemMessage(`${participant.username} entrou na sala`)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `streamhive_participants_${this.roomId}`,
        newValue: JSON.stringify(participants),
      }),
    )
  }

  leaveRoom() {
    const participants = this.getParticipants()
    const participantIndex = participants.findIndex((p) => p.id === this.userId)

    if (participantIndex >= 0) {
      const participant = participants[participantIndex]
      participants[participantIndex] = { ...participant, isOnline: false }
      localStorage.setItem(`streamhive_participants_${this.roomId}`, JSON.stringify(participants))

      this.sendSystemMessage(`${this.username} saiu da sala`)

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `streamhive_participants_${this.roomId}`,
          newValue: JSON.stringify(participants),
        }),
      )
    }
  }

  removeParticipant(participantId: string) {
    const participants = this.getParticipants()
    const participantIndex = participants.findIndex((p) => p.id === participantId)

    if (participantIndex >= 0) {
      const participant = participants[participantIndex]
      participants.splice(participantIndex, 1)
      localStorage.setItem(`streamhive_participants_${this.roomId}`, JSON.stringify(participants))

      this.sendSystemMessage(`${participant.username} foi removido da sala`)

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `streamhive_participants_${this.roomId}`,
          newValue: JSON.stringify(participants),
        }),
      )
    }
  }

  private getMessages(): ChatMessage[] {
    return JSON.parse(localStorage.getItem(`streamhive_chat_${this.roomId}`) || "[]")
  }

  private getParticipants(): Participant[] {
    return JSON.parse(localStorage.getItem(`streamhive_participants_${this.roomId}`) || "[]")
  }

  cleanup() {
    window.removeEventListener("storage", this.handleStorageChange.bind(this))
    this.listeners = []
    this.participantListeners = []
  }
}
