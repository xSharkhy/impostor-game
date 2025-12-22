import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { DomainError } from '../../../../domain/errors/DomainError.js'
import { RoomMapper } from '../../../../application/dto/RoomDTO.js'
import type { Container } from '../../../../config/container.js'

export interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
  user: {
    id: string
    displayName: string
    email?: string
  }
}

export function createRoomHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  container: Container
) {
  const { createRoomUseCase, joinRoomUseCase, leaveRoomUseCase, kickPlayerUseCase } = container

  return function registerRoomHandlers(socket: AuthenticatedSocket) {
    const { user } = socket

    // Create room
    socket.on('room:create', async () => {
      try {
        const result = await createRoomUseCase.execute({
          userId: user.id,
          displayName: user.displayName,
        })

        // Join socket room
        socket.join(result.room.id)

        // Send room created event
        socket.emit('room:created', { code: result.room.code })
        socket.emit('room:state', RoomMapper.toDTO(result.room, user.id) as any)

        console.log(`Room ${result.room.code} created by ${user.displayName}`)
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
        const result = await joinRoomUseCase.execute({
          code,
          userId: user.id,
          displayName: user.displayName,
        })

        // Join socket room
        socket.join(result.room.id)

        // Send state to joining player
        socket.emit('room:state', RoomMapper.toDTO(result.room, user.id) as any)

        // Notify others (only if not reconnecting)
        if (!result.isReconnect) {
          socket.to(result.room.id).emit('room:playerJoined', {
            id: user.id,
            displayName: user.displayName,
            isConnected: true,
            isEliminated: false,
            hasVoted: false,
          })
        }

        console.log(`${user.displayName} joined room ${result.room.code}`)
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
