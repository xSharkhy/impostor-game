import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { DomainError } from '../../../../domain/errors/DomainError.js'
import { RoomMapper } from '../../../../application/dto/RoomDTO.js'
import type { Container } from '../../../../config/container.js'
import { getSupabaseClient } from '../../../../config/supabase.js'

export interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
  user: {
    id: string
    displayName: string
    email?: string
  }
}

// Refresh display name from profiles table and update socket cache
async function refreshDisplayName(socket: AuthenticatedSocket): Promise<string> {
  const { user } = socket
  const supabase = getSupabaseClient()

  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (data?.display_name && data.display_name !== user.displayName) {
    console.log(`[refreshDisplayName] "${user.displayName}" -> "${data.display_name}"`)
    user.displayName = data.display_name
  }

  return user.displayName
}

export function createRoomHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  container: Container
) {
  const { createRoomUseCase, joinRoomUseCase, leaveRoomUseCase, kickPlayerUseCase } = container

  return function registerRoomHandlers(socket: AuthenticatedSocket) {
    const { user } = socket

    // Create room
    socket.on('room:create', async ({ language }) => {
      try {
        // Refresh display name from DB before creating room
        const displayName = await refreshDisplayName(socket)

        const result = await createRoomUseCase.execute({
          userId: user.id,
          displayName,
          language: language || 'es',
        })

        // Join socket room
        socket.join(result.room.id)

        // Send room created event
        socket.emit('room:created', { code: result.room.code })
        socket.emit('room:state', RoomMapper.toDTO(result.room, user.id) as any)

        console.log(`Room ${result.room.code} created by ${displayName}`)
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error creating room:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al crear la sala',
          })
        }
      }
    })

    // Join room
    socket.on('room:join', async ({ code }) => {
      try {
        // Refresh display name from DB before joining room
        const displayName = await refreshDisplayName(socket)

        const result = await joinRoomUseCase.execute({
          code,
          userId: user.id,
          displayName,
        })

        // Join socket room
        socket.join(result.room.id)

        // Send state to joining player
        socket.emit('room:state', RoomMapper.toDTO(result.room, user.id) as any)

        // Notify others (only if not reconnecting)
        if (!result.isReconnect) {
          socket.to(result.room.id).emit('room:playerJoined', {
            id: user.id,
            displayName,
            isConnected: true,
            isEliminated: false,
            hasVoted: false,
          })
        }

        console.log(`${displayName} joined room ${result.room.code}`)
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error joining room:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al unirse a la sala',
          })
        }
      }
    })

    // Leave room
    socket.on('room:leave', async () => {
      try {
        const result = await leaveRoomUseCase.execute({
          userId: user.id,
        })

        if (!result.room) return

        // Leave socket room
        socket.leave(result.room.id)

        // Notify others
        if (!result.wasDeleted) {
          io.to(result.room.id).emit('room:playerLeft', { playerId: user.id })

          if (result.newAdminId) {
            io.to(result.room.id).emit('room:adminChanged', { newAdminId: result.newAdminId })
          }
        }

        console.log(`${user.displayName} left room ${result.room.code}`)
      } catch (error) {
        console.error('Error leaving room:', error)
      }
    })

    // Kick player (admin only)
    socket.on('room:kick', async ({ playerId }) => {
      try {
        const result = await kickPlayerUseCase.execute({
          adminId: user.id,
          targetId: playerId,
        })

        // Notify all players in the room
        io.to(result.room.id).emit('room:playerKicked', { playerId })

        // Force kicked player to leave socket room
        const kickedSocket = Array.from(io.sockets.sockets.values()).find(
          (s) => (s as AuthenticatedSocket).user?.id === playerId
        )
        if (kickedSocket) {
          kickedSocket.leave(result.room.id)
        }

        console.log(`${playerId} was kicked from room ${result.room.code}`)
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error kicking player:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al expulsar jugador',
          })
        }
      }
    })

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        const result = await leaveRoomUseCase.execute({
          userId: user.id,
        })

        if (result.room && !result.wasDeleted) {
          io.to(result.room.id).emit('room:playerLeft', { playerId: user.id })

          if (result.newAdminId) {
            io.to(result.room.id).emit('room:adminChanged', { newAdminId: result.newAdminId })
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error)
      }
    })
  }
}
