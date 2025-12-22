import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { DomainError } from '../../../../domain/errors/DomainError.js'
import type { Container } from '../../../../config/container.js'
import type { AuthenticatedSocket } from './RoomHandler.js'

export function createVotingHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  container: Container
) {
  const { startVotingUseCase, castVoteUseCase, confirmVoteUseCase, roomRepository } = container

  return function registerVotingHandlers(socket: AuthenticatedSocket) {
    const { user } = socket

    // Start voting (admin only)
    socket.on('game:startVoting', async () => {
      try {
        const result = await startVotingUseCase.execute({
          adminId: user.id,
        })

        io.to(result.room.id).emit('game:votingStarted')
        console.log(`Voting started in room ${result.room.code}`)
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error starting voting:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al iniciar la votación',
          })
        }
      }
    })

    // Cast vote
    socket.on('vote:cast', async ({ targetId }) => {
      try {
        const result = await castVoteUseCase.execute({
          voterId: user.id,
          targetId,
        })

        // Build votes map for client
        const votes: Record<string, string> = {}
        let voteCounts: Record<string, number> = {}

        for (const player of result.room.activePlayers) {
          if (player.hasVoted && player.votedFor) {
            votes[player.id] = player.votedFor
            voteCounts[player.votedFor] = (voteCounts[player.votedFor] || 0) + 1
          }
        }

        // Check if 2/3 reached
        const { twoThirdsReached } = result.room.calculateVotes()

        io.to(result.room.id).emit('vote:update', { votes, twoThirdsReached })
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error casting vote:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al votar',
          })
        }
      }
    })

    // Confirm elimination (admin only)
    socket.on('vote:confirm', async ({ eliminate }) => {
      try {
        // Get room first to get the id
        const room = await roomRepository.findByPlayerId(user.id)
        if (!room) {
          socket.emit('error', {
            code: 'ROOM_NOT_FOUND',
            message: 'No estás en una sala',
          })
          return
        }

        if (!eliminate) {
          // Continue without elimination - just change state back to playing
          const updatedRoom = room.continueAfterVoting()
          await roomRepository.save(updatedRoom)

          io.to(room.id).emit('vote:result', {})
          return
        }

        const result = await confirmVoteUseCase.execute({
          adminId: user.id,
        })

        if (result.isTie) {
          io.to(result.room.id).emit('vote:result', {})
          return
        }

        if (result.gameEnded) {
          const winner = result.winCondition === 'impostor_caught' ? 'crew' : 'impostor'
          io.to(result.room.id).emit('vote:result', {
            eliminated: result.eliminatedPlayerId ?? undefined,
            wasImpostor: result.winCondition === 'impostor_caught',
          })
          io.to(result.room.id).emit('game:ended', {
            winner,
            impostorId: result.room.impostorId!,
          })
          console.log(`Game ended in room: ${winner} wins!`)
        } else {
          io.to(result.room.id).emit('vote:result', {
            eliminated: result.eliminatedPlayerId ?? undefined,
            wasImpostor: false,
          })
        }
      } catch (error) {
        if (error instanceof DomainError) {
          socket.emit('error', {
            code: error.code,
            message: error.message,
          })
        } else {
          console.error('Error confirming vote:', error)
          socket.emit('error', {
            code: 'UNKNOWN_ERROR',
            message: 'Error al confirmar votación',
          })
        }
      }
    })
  }
}
