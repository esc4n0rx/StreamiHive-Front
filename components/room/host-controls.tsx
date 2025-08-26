"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Room } from "@/lib/rooms"
import { Settings, Edit, StopCircle, Save, X } from "lucide-react"

interface HostControlsProps {
  room: Room
  onRoomUpdated: (room: Room) => void
  onRoomEnded: () => void
}

export function HostControls({ room, onRoomUpdated, onRoomEnded }: HostControlsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    name: room.name,
    description: room.description,
    streamUrl: room.streamUrl,
  })

  const handleSaveChanges = () => {
    const updatedRoom = { ...room, ...editForm }

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem("streamhive_rooms") || "[]")
    const roomIndex = rooms.findIndex((r: Room) => r.id === room.id)
    if (roomIndex >= 0) {
      rooms[roomIndex] = updatedRoom
      localStorage.setItem("streamhive_rooms", JSON.stringify(rooms))
    }

    onRoomUpdated(updatedRoom)
    setShowEditDialog(false)
  }

  const handleEndRoom = () => {
    if (confirm("Tem certeza que deseja encerrar esta sala? Esta ação não pode ser desfeita.")) {
      // Mark room as inactive
      const rooms = JSON.parse(localStorage.getItem("streamhive_rooms") || "[]")
      const roomIndex = rooms.findIndex((r: Room) => r.id === room.id)
      if (roomIndex >= 0) {
        rooms[roomIndex] = { ...room, isActive: false }
        localStorage.setItem("streamhive_rooms", JSON.stringify(rooms))
      }

      onRoomEnded()
    }
  }

  return (
    <Card className="streamhive-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Controles do Host
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Editar Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Sala</DialogTitle>
                <DialogDescription>Faça alterações nas informações da sala</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da Sala</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL da Transmissão</Label>
                  <Input
                    id="edit-url"
                    value={editForm.streamUrl}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, streamUrl: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveChanges} className="flex-1 streamhive-button-accent">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="destructive" onClick={handleEndRoom} className="gap-2">
            <StopCircle className="h-4 w-4" />
            Encerrar Sala
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">Estatísticas da Sala</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Criada em:</span>
              <p>{new Date(room.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Participantes:</span>
              <p>
                {room.currentParticipants}/{room.maxParticipants}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
