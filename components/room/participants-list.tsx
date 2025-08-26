"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Participant } from "@/lib/chat"
import { Users, Crown, UserMinus, Clock } from "lucide-react"

interface ParticipantsListProps {
  participants: Participant[]
  isHost: boolean
  onRemoveParticipant: (participantId: string) => void
}

export function ParticipantsList({ participants, isHost, onRemoveParticipant }: ParticipantsListProps) {
  return (
    <Card className="streamhive-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Participantes ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">{participant.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{participant.username}</span>
                    {participant.isHost && <Crown className="h-4 w-4 text-accent" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Entrou às{" "}
                    {new Date(participant.joinedAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={participant.isOnline ? "default" : "secondary"}>
                  {participant.isOnline ? "Online" : "Offline"}
                </Badge>
                {isHost && !participant.isHost && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemoveParticipant(participant.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}

          {participants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum participante online</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
