"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Room } from "@/lib/rooms"
import { Lock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface JoinRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onJoin: (roomId: string, password?: string) => Promise<void>
}

export function JoinRoomModal({ open, onOpenChange, room, onJoin }: JoinRoomModalProps) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room) return

    setError("")
    setLoading(true)

    try {
      await onJoin(room.id, password)
      onOpenChange(false)
      setPassword("")
      // Navigate to room
      router.push(`/room/${room.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar na sala")
    } finally {
      setLoading(false)
    }
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Entrar na Sala
          </DialogTitle>
          <DialogDescription>Esta sala requer senha para acesso</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">{room.name}</h3>
            <p className="text-sm text-muted-foreground">{room.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha da Sala</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 streamhive-button-accent">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
