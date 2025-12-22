import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { supabase } from '@/lib/supabase'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connect = async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        setError('Not authenticated')
        return
      }

      const socket: TypedSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      })

      socket.on('connect', () => {
        setIsConnected(true)
        setError(null)
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('connect_error', (err) => {
        setError(err.message)
        setIsConnected(false)
      })

      socketRef.current = socket
    }

    connect()

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    error,
  }
}
