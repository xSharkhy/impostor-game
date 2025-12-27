import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRoomStore, useGameStore, useUserStore } from '@/stores'
import { getCurrentLanguage, type SupportedLanguage } from '@/lib/i18n'
import type { ClientToServerEvents, ServerToClientEvents, GameMode } from '@impostor/shared'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

// Singleton socket instance
let socketInstance: TypedSocket | null = null
let isInitializing = false

// Export getter for socket instance (used by other hooks)
export function getSocketInstance(): TypedSocket | null {
  return socketInstance
}

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

      // Remove all previous listeners to avoid duplicates
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('room:state')
      socket.off('room:playerJoined')
      socket.off('room:playerLeft')
      socket.off('room:playerKicked')
      socket.off('room:adminChanged')
      socket.off('room:languageChanged')
      socket.off('error')
      socket.off('game:collectingStarted')
      socket.off('game:wordCollected')
      socket.off('game:started')
      socket.off('game:newRound')
      socket.off('game:votingStarted')
      socket.off('vote:update')
      socket.off('vote:result')
      socket.off('game:ended')

      socket.on('connect', () => {
        // Only show reconnection toast if we were previously connected
        const wasConnected = socketInstance?.recovered
        setIsConnected(true)
        setError(null)
        if (wasConnected) {
          toast.success('Conexión restablecida')
        }
      })

      socket.on('disconnect', (reason) => {
        setIsConnected(false)
        // Only show toast for unexpected disconnections
        if (reason !== 'io client disconnect') {
          toast.warning('Conexión perdida', {
            description: 'Intentando reconectar...',
          })
        }
      })

      socket.on('connect_error', (err) => {
        setError(err.message)
        setIsConnected(false)
        toast.error('Error de conexión', {
          description: err.message,
        })
      })

      socket.on('room:state', (room) => {
        useRoomStore.getState().setRoom(room)
        useRoomStore.getState().setConnecting(false)

        // Reset game state when room goes back to lobby (e.g., after playAgain)
        if (room.status === 'lobby') {
          useGameStore.getState().reset()
        }
      })

      socket.on('room:playerJoined', (player) => {
        useRoomStore.getState().addPlayer(player)
        toast.info(`${player.displayName} se ha unido`)
      })

      socket.on('room:playerLeft', ({ playerId }) => {
        const room = useRoomStore.getState().room
        const player = room?.players.find((p) => p.id === playerId)
        useRoomStore.getState().removePlayer(playerId)
        if (player) {
          toast.info(`${player.displayName} ha salido`)
        }
      })

      socket.on('room:playerKicked', ({ playerId }) => {
        const room = useRoomStore.getState().room
        const player = room?.players.find((p) => p.id === playerId)

        // Check if the current user was kicked
        const currentUserId = useUserStore.getState().user?.id
        if (playerId === currentUserId) {
          // Reset stores and show message
          useRoomStore.getState().reset()
          useGameStore.getState().reset()
          toast.error('Has sido expulsado de la sala')
          return
        }

        // Otherwise just remove the player from the list
        useRoomStore.getState().removePlayer(playerId)
        if (player) {
          toast.warning(`${player.displayName} ha sido expulsado`)
        }
      })

      socket.on('room:adminChanged', ({ newAdminId }) => {
        const room = useRoomStore.getState().room
        const newAdmin = room?.players.find((p) => p.id === newAdminId)
        useRoomStore.getState().setAdmin(newAdminId)
        if (newAdmin) {
          toast.info(`${newAdmin.displayName} es el nuevo admin`)
        }
      })

      socket.on('room:languageChanged', ({ language }) => {
        // Only update room state, not UI language
        // Game language and UI language are independent
        useRoomStore.getState().setLanguage(language as SupportedLanguage)
      })

      socket.on('error', ({ message }) => {
        useRoomStore.getState().setError(message)
        useRoomStore.getState().setConnecting(false)
        toast.error(message)
      })

      // Game events
      socket.on('game:collectingStarted', ({ timeLimit, minWords, playerCount, impostorCount }) => {
        useGameStore.getState().startCollecting({ timeLimit, minWords, playerCount, impostorCount })
      })

      socket.on('game:wordCollected', ({ count }) => {
        useGameStore.getState().updateWordCount(count)
      })

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

      socket.on('vote:result', ({ eliminated, wasImpostor, newRound }) => {
        useGameStore.getState().setVoteResult(eliminated, wasImpostor, newRound)
      })

      socket.on('game:ended', ({ winner, impostorIds, word }) => {
        useGameStore.getState().endGame(winner, impostorIds, word)
      })

      if (socket.connected) {
        setIsConnected(true)
      }
    }

    setupSocket()
  }, [])

  const createRoom = useCallback((language?: SupportedLanguage) => {
    if (!socketInstance?.connected) {
      toast.error('No hay conexión con el servidor')
      return
    }
    useRoomStore.getState().setConnecting(true)
    socketInstance.emit('room:create', { language: language || getCurrentLanguage() })
  }, [])

  const joinRoom = useCallback((code: string) => {
    if (!socketInstance?.connected) {
      toast.error('No hay conexión con el servidor')
      return
    }
    useRoomStore.getState().setConnecting(true)
    socketInstance.emit('room:join', { code })
  }, [])

  const leaveRoom = useCallback(() => {
    socketInstance?.emit('room:leave')
    useRoomStore.getState().reset()
  }, [])

  const kickPlayer = useCallback((playerId: string) => {
    socketInstance?.emit('room:kick', { playerId })
  }, [])

  const changeRoomLanguage = useCallback((language: SupportedLanguage) => {
    socketInstance?.emit('room:changeLanguage', { language })
  }, [])

  const startGame = useCallback((options?: { mode?: GameMode; category?: string; customWord?: string; impostorCount?: number }) => {
    socketInstance?.emit('game:start', {
      mode: options?.mode || 'classic',
      category: options?.category || '',
      customWord: options?.customWord,
      impostorCount: options?.impostorCount ?? 1,
    })
  }, [])

  const submitWord = useCallback((word: string) => {
    socketInstance?.emit('game:submitWord', { word })
    useGameStore.getState().markWordSubmitted()
  }, [])

  const forceStartRoulette = useCallback(() => {
    socketInstance?.emit('game:forceStart')
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
    // Only emit - the room:state handler will reset game state when room.status === 'lobby'
    socketInstance?.emit('game:playAgain')
  }, [])

  return {
    socket: socketInstance,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    kickPlayer,
    changeRoomLanguage,
    startGame,
    submitWord,
    forceStartRoulette,
    nextRound,
    startVoting,
    castVote,
    confirmVote,
    playAgain,
  }
}
