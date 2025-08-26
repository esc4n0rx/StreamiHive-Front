"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else if (showIndicator) {
        // Show "back online" message briefly
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    updateOnlineStatus()
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [showIndicator])

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                Conectado novamente
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                Sem conexão
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
