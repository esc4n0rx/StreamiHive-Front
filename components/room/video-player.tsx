"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Room } from "@/lib/rooms"
import { Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from "lucide-react"

interface VideoPlayerProps {
  room: Room
}

export function VideoPlayer({ room }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [showControls])

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&controls=1` : null
  }

  const isYouTube = room.streamType === "youtube"
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(room.streamUrl) : null

  return (
    <Card className="streamhive-card overflow-hidden">
      <CardContent className="p-0">
        <div
          className="relative aspect-video bg-black group cursor-pointer"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {isYouTube && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <ExternalLink className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Stream Externo</h3>
                <p className="text-white/70 mb-4">Este conteúdo está sendo transmitido de uma fonte externa</p>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => window.open(room.streamUrl, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Stream
                </Button>
              </div>
            </div>
          )}

          {/* Custom Controls Overlay (for external streams) */}
          {!isYouTube && (
            <div
              className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>

                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Transmissão Ativa</h3>
              <p className="text-sm text-muted-foreground">
                {isYouTube ? "YouTube" : "Stream Externo"} • Host: {room.hostName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-500">AO VIVO</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
