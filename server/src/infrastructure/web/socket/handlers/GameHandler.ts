import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { DomainError } from '../../../../domain/errors/DomainError.js'
import { RoomMapper } from '../../../../application/dto/RoomDTO.js'
import type { Container } from '../../../../config/container.js'
import type { AuthenticatedSocket } from './RoomHandler.js'

export function createGameHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  container: Container
) {
  const { startGameUseCase, nextRoundUseCase, playAgainUseCase } = container

  return function registerGameHandlers(socket: AuthenticatedSocket) {
    const { user } = socket

    // Start game (admin only)
    socket.on('game:start', async ({ mode, category }) => {
      try {
        const result = await startGameUseCase.execute({
          adminId: user.id,
          mode: mode || 'classic',
          categoryId: category,
        })

        // Send game started event to each player
        const sockets = await io.in(result.room.id).fetchSockets()
        for (const s of sockets) {
          const authSocket = s as unknown as AuthenticatedSocket
          const isImpostor = authSocket.user.id === result.impostorId

          s.emit('game:started', {
            word: isImpostor ? null : result.word,
            isImpostor,
            turnOrder: result.room.turnOrder ?? [],
            mode: result.mode,
          })
        }

        console.log(`Game started in room ${result.room.code} (mode: ${result.mode})`)
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error starting game:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al iniciar la partida',
          })
        }
      }
    })

    // Next round (admin only)
    socket.on('game:nextRound', async () => {
      try {
        const result = await nextRoundUseCase.execute({
          playerId: user.id,
        })

        io.to(result.room.id).emit('game:newRound', { round: result.room.currentRound })
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error advancing round:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al avanzar la ronda',
          })
        }
      }
    })

    // Play again (admin only)
    socket.on('game:playAgain', async () => {
      try {
        const result = await playAgainUseCase.execute({
          adminId: user.id,
        })

        // Send updated room state to all players
        const sockets = await io.in(result.room.id).fetchSockets()
        for (const s of sockets) {
          const authSocket = s as unknown as AuthenticatedSocket
          s.emit('room:state', RoomMapper.toDTO(result.room, authSocket.user.id) as any)
        }

        console.log(`Game reset in room ${result.room.code}`)
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error resetting game:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al reiniciar la partida',
          })
        }
      }
    })
  }
}
