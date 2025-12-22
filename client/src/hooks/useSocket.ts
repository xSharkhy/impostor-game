import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { supabase } from '@/lib/supabase'
import { useRoomStore } from '@/stores'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

// Singleton socket instance
let socketInstance: TypedSocket | null = null
let isInitializing = false

async function getOrCreateSocket(): Promise<TypedSocket | null> {
  if (socketInstance?.connected) return socketInstance
  if (isInitializing) return null

  isInitializing = true

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    isInitializing = false
    return null
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  })

  isInitializing = false
  return socketInstance
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const roomStore = useRoomStore.getState()

    const setupSocket = async () => {
      const socket = await getOrCreateSocket()
      if (!socket) {
        setError('Not authenticated')
        return
      }

      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('room:state')
      socket.off('room:playerJoined')
      socket.off('room:playerLeft')
      socket.off('room:playerKicked')
      socket.off('room:adminChanged')
      socket.off('error')

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

      socket.on('room:state', (room) => {
        useRoomStore.getState().setRoom(room)
      })

      socket.on('room:playerJoined', (player) => {
        useRoomStore.getState().addPlayer(player)
      })

      socket.on('room:playerLeft', ({ playerId }) => {
        useRoomStore.getState().removePlayer(playerId)
      })

      socket.on('room:playerKicked', ({ playerId }) => {
        useRoomStore.getState().removePlayer(playerId)
      })

      socket.on('room:adminChanged', ({ newAdminId }) => {
        useRoomStore.getState().setAdmin(newAdminId)
      })

      socket.on('error', ({ message }) => {
        useRoomStore.getState().setError(message)
      })

      if (socket.connected) {
        setIsConnected(true)
      }
    }

    setupSocket()
  }, [])

  const createRoom = useCallback(() => {
    socketInstance?.emit('room:create')
  }, [])

  const joinRoom = useCallback((code: string) => {
    socketInstance?.emit('room:join', { code })
  }, [])

  const leaveRoom = useCallback(() => {
    socketInstance?.emit('room:leave')
    useRoomStore.getState().reset()
  }, [])

  const kickPlayer = useCallback((playerId: string) => {
    socketInstance?.emit('room:kick', { playerId })
  }, [])

  return {
    socket: socketInstance,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    kickPlayer,
  }
}
