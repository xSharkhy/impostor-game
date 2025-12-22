import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, ClientRoom } from '@impostor/shared'
import { ErrorCodes } from '@impostor/shared'
import { roomManager } from '../../services/RoomManager.js'
import { gameManager } from '../../services/GameManager.js'
import type { AuthenticatedSocket } from '../../middleware/auth.js'

// Convert server room to client room (hide impostorId)
function toClientRoom(room: any): ClientRoom {
  const { impostorId, ...clientRoom } = room
  return clientRoom
}

export function registerGameHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) {
  const { user } = socket

  // Start game (admin only)
  socket.on('game:start', async ({ category }) => {
    const room = roomManager.getPlayerRoom(user.id)

    if (!room) {
      socket.emit('error', {
        code: ErrorCodes.ROOM_NOT_FOUND,
        message: 'No estás en una sala',
      })
      return
    }

    if (room.adminId !== user.id) {
      socket.emit('error', {
        code: ErrorCodes.NOT_ADMIN,
        message: 'Solo el admin puede iniciar la partida',
      })
      return
    }

    const result = await gameManager.startGame(room.id, category)

    if ('error' in result) {
      socket.emit('error', {
        code: result.error,
        message: getErrorMessage(result.error),
      })
      return
    }

    // Send game started event to each player
    const sockets = await io.in(room.id).fetchSockets()
    for (const s of sockets) {
      const authSocket = s as unknown as AuthenticatedSocket
      const isImpostor = authSocket.user.id === result.impostorId

      s.emit('game:started', {
        word: isImpostor ? null : result.word,
        isImpostor,
        turnOrder: result.turnOrder,
      })
    }

    console.log(`Game started in room ${room.code}, impostor: hidden`)
  })

  // Next round (admin only)
  socket.on('game:nextRound', () => {
    const room = roomManager.getPlayerRoom(user.id)

    if (!room) {
      socket.emit('error', {
        code: ErrorCodes.ROOM_NOT_FOUND,
        message: 'No estás en una sala',
      })
      return
    }

    if (room.adminId !== user.id) {
      socket.emit('error', {
        code: ErrorCodes.NOT_ADMIN,
        message: 'Solo el admin puede avanzar la ronda',
      })
      return
    }

    const result = gameManager.nextRound(room.id)

    if ('error' in result) {
      socket.emit('error', {
        code: result.error,
        message: getErrorMessage(result.error),
      })
      return
    }

    io.to(room.id).emit('game:newRound', { round: result.round })
  })

  // Play again (admin only)
  socket.on('game:playAgain', () => {
    const room = roomManager.getPlayerRoom(user.id)

    if (!room) {
      socket.emit('error', {
        code: ErrorCodes.ROOM_NOT_FOUND,
        message: 'No estás en una sala',
      })
      return
    }

    if (room.adminId !== user.id) {
      socket.emit('error', {
        code: ErrorCodes.NOT_ADMIN,
        message: 'Solo el admin puede iniciar nueva partida',
      })
      return
    }

    // Reset room to lobby state
    room.status = 'lobby'
    room.currentWord = undefined
    room.impostorId = undefined
    room.turnOrder = undefined
    room.currentRound = 0
    room.lastActivity = new Date()

    // Reset all players
    for (const player of room.players) {
      player.isEliminated = false
      player.hasVoted = false
      player.votedFor = undefined
    }

    // Send updated room state to all
    io.to(room.id).emit('room:state', toClientRoom(room))
    console.log(`Game reset in room ${room.code}`)
  })
}

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    ROOM_NOT_FOUND: 'Sala no encontrada',
    NOT_ENOUGH_PLAYERS: 'Se necesitan al menos 3 jugadores',
    GAME_ALREADY_STARTED: 'La partida ya ha comenzado',
    GAME_NOT_IN_PROGRESS: 'No hay partida en curso',
    NO_WORDS_AVAILABLE: 'No hay palabras disponibles',
  }
  return messages[code] || 'Error desconocido'
}
