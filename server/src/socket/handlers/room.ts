import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, ClientRoom } from '@impostor/shared'
import { ErrorCodes } from '@impostor/shared'
import { roomManager } from '../../services/RoomManager.js'
import type { AuthenticatedSocket } from '../../middleware/auth.js'

// Convert server room to client room (hide impostorId)
function toClientRoom(room: any): ClientRoom {
  const { impostorId, ...clientRoom } = room
  return clientRoom
}

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) {
  const { user } = socket

  // Create room
  socket.on('room:create', () => {
    const result = roomManager.createRoom(user.id, user.displayName)

    if ('error' in result) {
      socket.emit('error', {
        code: result.error,
        message: getErrorMessage(result.error),
      })
      return
    }

    // Join socket room
    socket.join(result.id)

    // Send room created event
    socket.emit('room:created', { code: result.code })
    socket.emit('room:state', toClientRoom(result))

    console.log(`Room ${result.code} created by ${user.displayName}`)
  })

  // Join room
  socket.on('room:join', ({ code }) => {
    const result = roomManager.joinRoom(code, user.id, user.displayName)

    if ('error' in result) {
      socket.emit('error', {
        code: result.error,
        message: getErrorMessage(result.error),
      })
      return
    }

    // Join socket room
    socket.join(result.id)

    // Send state to joining player
    socket.emit('room:state', toClientRoom(result))

    // Notify others
    socket.to(result.id).emit('room:playerJoined', {
      id: user.id,
      displayName: user.displayName,
      isConnected: true,
      isEliminated: false,
      hasVoted: false,
    })

    console.log(`${user.displayName} joined room ${result.code}`)
  })

  // Leave room
  socket.on('room:leave', () => {
    const result = roomManager.leaveRoom(user.id)

    if (!result) return

    const { room, newAdmin } = result

    // Leave socket room
    socket.leave(room.id)

    // Notify others
    io.to(room.id).emit('room:playerLeft', { playerId: user.id })

    if (newAdmin) {
      io.to(room.id).emit('room:adminChanged', { newAdminId: newAdmin })
    }

    console.log(`${user.displayName} left room ${room.code}`)
  })

  // Kick player (admin only)
  socket.on('room:kick', ({ playerId }) => {
    const result = roomManager.kickPlayer(user.id, playerId)

    if ('error' in result) {
      socket.emit('error', {
        code: result.error,
        message: getErrorMessage(result.error),
      })
      return
    }

    // Notify the kicked player
    io.to(result.room.id).emit('room:playerKicked', { playerId })

    // Force kicked player to leave socket room
    const kickedSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => (s as AuthenticatedSocket).user?.id === playerId
    )
    if (kickedSocket) {
      kickedSocket.leave(result.room.id)
    }

    console.log(`${playerId} was kicked from room ${result.room.code}`)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    const room = roomManager.disconnectPlayer(user.id)

    if (room) {
      // Check if all players disconnected
      const allDisconnected = room.players.every((p) => !p.isConnected)

      if (!allDisconnected) {
        // Notify others that player disconnected
        socket.to(room.id).emit('room:playerLeft', { playerId: user.id })

        // If admin disconnected, transfer
        if (room.adminId === user.id) {
          const connectedPlayer = room.players.find((p) => p.isConnected)
          if (connectedPlayer) {
            room.adminId = connectedPlayer.id
            io.to(room.id).emit('room:adminChanged', { newAdminId: connectedPlayer.id })
          }
        }
      }
    }
  })
}

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    [ErrorCodes.ROOM_NOT_FOUND]: 'Sala no encontrada',
    [ErrorCodes.MAX_ROOMS_REACHED]: 'Límite de salas alcanzado',
    [ErrorCodes.GAME_ALREADY_STARTED]: 'La partida ya ha comenzado',
    [ErrorCodes.NOT_ADMIN]: 'Solo el admin puede hacer esto',
    ALREADY_IN_ROOM: 'Ya estás en una sala',
    CANNOT_KICK_SELF: 'No puedes expulsarte a ti mismo',
    PLAYER_NOT_FOUND: 'Jugador no encontrado',
  }
  return messages[code] || 'Error desconocido'
}
