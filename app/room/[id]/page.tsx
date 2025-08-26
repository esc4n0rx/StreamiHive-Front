"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { VideoPlayer } from "@/components/room/video-player"
import { ParticipantsList } from "@/components/room/participants-list"
import { HostControls } from "@/components/room/host-controls"
import { FadeIn, SlideUp } from "@/components/ui/motion-wrapper"
import { useAuth } from "@/contexts/auth-context"
import type { Room } from "@/lib/rooms"
import { ChatService, type ChatMessage, type Participant } from "@/lib/chat"
import { Send, Users, Settings, ArrowLeft, Loader2, MessageCircle, Crown, X } from "lucide-react"

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showChatPopup, setShowChatPopup] = useState(false)
  const [showParticipantsPopup, setShowParticipantsPopup] = useState(false)
  const [showHostControlsPopup, setShowHostControlsPopup] = useState(false)

  const chatServiceRef = useRef<ChatService | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    loadRoom()
  }, [roomId, user])

  useEffect(() => {
    if (room && user && !chatServiceRef.current) {
      // Initialize chat service
      chatServiceRef.current = new ChatService(roomId, user.id, user.username)

      // Set up listeners
      chatServiceRef.current.onMessagesUpdate(setMessages)
      chatServiceRef.current.onParticipantsUpdate(setParticipants)

      // Join room
      const participant: Participant = {
        id: user.id,
        username: user.username,
        name: user.name,
        joinedAt: new Date().toISOString(),
        isHost: room.hostId === user.id,
        isOnline: true,
      }

      chatServiceRef.current.joinRoom(participant)
    }

    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.leaveRoom()
        chatServiceRef.current.cleanup()
        chatServiceRef.current = null
      }
    }
  }, [room, user, roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadRoom = async () => {
    setLoading(true)
    try {
      // In a real app, this would be an API call to get room by ID
      const rooms = JSON.parse(localStorage.getItem("streamhive_rooms") || "[]")
      const foundRoom = rooms.find((r: Room) => r.id === roomId)

      if (!foundRoom) {
        setError("Sala não encontrada")
        return
      }

      if (!foundRoom.isActive) {
        setError("Esta sala não está mais ativa")
        return
      }

      setRoom(foundRoom)
    } catch (err) {
      setError("Erro ao carregar sala")
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chatServiceRef.current) return

    chatServiceRef.current.sendMessage(newMessage.trim())
    setNewMessage("")
  }

  const isHost = user && room && room.hostId === user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <FadeIn>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-muted-foreground">Carregando sala...</p>
            </div>
          </FadeIn>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <FadeIn>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Ops!</h1>
              <p className="text-muted-foreground mb-6">{error || "Sala não encontrada"}</p>
              <Button onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    )
  }

  const onlineParticipants = participants.filter((p) => p.isOnline)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Room Header */}
        <FadeIn>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {room.name}
                  {isHost && <Crown className="h-5 w-5 text-accent" />}
                </h1>
                <p className="text-muted-foreground">{room.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{room.category}</Badge>
              <Badge variant="outline">{room.ageRating}</Badge>
            </div>
          </div>
        </FadeIn>

        <div className="w-full">
          <SlideUp>
            <VideoPlayer room={room} />
          </SlideUp>
        </div>

        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          {/* Chat Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="streamhive-button-accent rounded-full h-14 w-14 shadow-lg"
              onClick={() => setShowChatPopup(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* Participants Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-14 w-14 shadow-lg bg-background/80 backdrop-blur-sm relative"
              onClick={() => setShowParticipantsPopup(true)}
            >
              <Users className="h-6 w-6" />
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                {onlineParticipants.length}
              </Badge>
            </Button>
          </motion.div>

          {/* Host Controls Button */}
          {isHost && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-14 w-14 shadow-lg bg-background/80 backdrop-blur-sm"
                onClick={() => setShowHostControlsPopup(true)}
              >
                <Settings className="h-6 w-6" />
              </Button>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showChatPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowChatPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md h-[600px]"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="streamhive-card h-full flex flex-col">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Chat
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowChatPopup(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 px-4">
                      <div className="space-y-3">
                        <AnimatePresence>
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`${
                                message.type === "system" ? "text-center text-sm text-muted-foreground italic" : ""
                              }`}
                            >
                              {message.type === "message" ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{message.username}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm break-words">{message.message}</p>
                                </div>
                              ) : (
                                <p>{message.message}</p>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <Separator />

                    {/* Message Input */}
                    <div className="p-4">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1"
                          maxLength={500}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="streamhive-button-accent"
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showParticipantsPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowParticipantsPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 z-10 rounded-full bg-background shadow-lg"
                    onClick={() => setShowParticipantsPopup(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <ParticipantsList
                    participants={onlineParticipants}
                    isHost={isHost}
                    onRemoveParticipant={(participantId) => {
                      chatServiceRef.current?.removeParticipant(participantId)
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHostControlsPopup && isHost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowHostControlsPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 z-10 rounded-full bg-background shadow-lg"
                    onClick={() => setShowHostControlsPopup(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <HostControls room={room} onRoomUpdated={setRoom} onRoomEnded={() => router.push("/dashboard")} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
