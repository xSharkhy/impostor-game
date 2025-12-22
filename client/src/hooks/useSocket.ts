import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { supabase } from '@/lib/supabase'
import { useRoomStore, useGameStore } from '@/stores'
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

      // Game events
      socket.on('game:started', (data) => {
        useGameStore.getState().startGame(data)
      })

      socket.on('game:newRound', ({ round }) => {
        useGameStore.getState().setRound(round)
      })

      socket.on('game:votingStarted', () => {
        useGameStore.getState().startVoting()
      })

      socket.on('vote:update', ({ votes, twoThirdsReached }) => {
        useGameStore.getState().updateVotes(votes, twoThirdsReached)
      })

      socket.on('vote:result', ({ eliminated, wasImpostor }) => {
        useGameStore.getState().setVoteResult(eliminated, wasImpostor)
      })

      socket.on('game:ended', ({ winner, impostorId }) => {
        useGameStore.getState().endGame(winner, impostorId)
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

  const startGame = useCallback((category?: string) => {
    socketInstance?.emit('game:start', { category: category || '' })
  }, [])

  const nextRound = useCallback(() => {
    socketInstance?.emit('game:nextRound')
  }, [])

  const startVoting = useCallback(() => {
    socketInstance?.emit('game:startVoting')
  }, [])

  const castVote = useCallback((targetId: string) => {
    socketInstance?.emit('vote:cast', { targetId })
    useGameStore.getState().castVote(targetId)
  }, [])

  const confirmVote = useCallback((eliminate: boolean) => {
    socketInstance?.emit('vote:confirm', { eliminate })
  }, [])

  const playAgain = useCallback(() => {
    socketInstance?.emit('game:playAgain')
    useGameStore.getState().reset()
  }, [])

  return {
    socket: socketInstance,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    kickPlayer,
    startGame,
    nextRound,
    startVoting,
    castVote,
    confirmVote,
    playAgain,
  }
}
