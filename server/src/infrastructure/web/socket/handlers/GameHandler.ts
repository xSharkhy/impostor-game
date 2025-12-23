import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { DomainError } from '../../../../domain/errors/DomainError.js'
import { RoomMapper } from '../../../../application/dto/RoomDTO.js'
import type { Container } from '../../../../config/container.js'
import type { AuthenticatedSocket } from './RoomHandler.js'
import type { StartCollectingOutput } from '../../../../application/useCases/game/StartGameUseCase.js'

export function createGameHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  container: Container
) {
  const { startGameUseCase, nextRoundUseCase, playAgainUseCase, submitWordUseCase, forceStartRouletteUseCase } = container

  return function registerGameHandlers(socket: AuthenticatedSocket) {
    const { user } = socket

    // Start game (admin only)
    socket.on('game:start', async ({ mode, category, customWord }) => {
      try {
        const result = await startGameUseCase.execute({
          adminId: user.id,
          mode: mode || 'classic',
          categoryId: category,
          customWord,
        })

        // Roulette mode: start collecting phase
        if (result.mode === 'roulette') {
          const collectingResult = result as StartCollectingOutput
          io.to(collectingResult.room.id).emit('game:collectingStarted', {
            timeLimit: collectingResult.timeLimit,
            minWords: collectingResult.minWords,
            playerCount: collectingResult.playerCount,
          })
          console.log(`Roulette collecting started in room ${collectingResult.room.code}`)
          return
        }

        // Other modes: game started directly
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

    // Submit word (roulette mode)
    socket.on('game:submitWord', async ({ word }) => {
      try {
        const result = await submitWordUseCase.execute({
          playerId: user.id,
          word,
        })

        // Notify all players about the new word count
        io.to(result.room.id).emit('game:wordCollected', {
          count: result.wordCount,
        })

        // Auto-start if all players submitted
        if (result.allSubmitted) {
          const startResult = await forceStartRouletteUseCase.execute({
            adminId: result.room.adminId,
          })

          // Send game started event to each player
          const sockets = await io.in(startResult.room.id).fetchSockets()
          for (const s of sockets) {
            const authSocket = s as unknown as AuthenticatedSocket
            const isImpostor = authSocket.user.id === startResult.impostorId

            s.emit('game:started', {
              word: isImpostor ? null : startResult.word,
              isImpostor,
              turnOrder: startResult.room.turnOrder ?? [],
              mode: 'roulette',
            })
          }

          console.log(`Roulette auto-started in room ${startResult.room.code}`)
        }
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error submitting word:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al enviar la palabra',
          })
        }
      }
    })

    // Force start roulette (admin only)
    socket.on('game:forceStart', async () => {
      try {
        const result = await forceStartRouletteUseCase.execute({
          adminId: user.id,
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
            mode: 'roulette',
          })
        }

        console.log(`Roulette force-started in room ${result.room.code}`)
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error force starting roulette:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al iniciar la ruleta',
          })
        }
      }
    })
  }
}
