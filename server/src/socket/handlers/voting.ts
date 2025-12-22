import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { ErrorCodes } from '@impostor/shared'
import { roomManager } from '../../services/RoomManager.js'
import type { AuthenticatedSocket } from '../../middleware/auth.js'

export function registerVotingHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) {
  const { user } = socket

  // Start voting (admin only)
  socket.on('game:startVoting', () => {
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
        message: 'Solo el admin puede iniciar la votación',
      })
      return
    }

    if (room.status !== 'playing') {
      socket.emit('error', {
        code: 'INVALID_STATE',
        message: 'No hay partida en curso',
      })
      return
    }

    room.status = 'voting'
    room.lastActivity = new Date()

    // Reset votes
    for (const player of room.players) {
      player.hasVoted = false
      player.votedFor = undefined
    }

    io.to(room.id).emit('game:votingStarted')
    console.log(`Voting started in room ${room.code}`)
  })

  // Cast vote
  socket.on('vote:cast', ({ targetId }) => {
    const room = roomManager.getPlayerRoom(user.id)

    if (!room) {
      socket.emit('error', {
        code: ErrorCodes.ROOM_NOT_FOUND,
        message: 'No estás en una sala',
      })
      return
    }

    if (room.status !== 'voting') {
      socket.emit('error', {
        code: 'INVALID_STATE',
        message: 'No es momento de votar',
      })
      return
    }

    const voter = room.players.find((p) => p.id === user.id)
    if (!voter || voter.isEliminated) {
      socket.emit('error', {
        code: 'CANNOT_VOTE',
        message: 'No puedes votar',
      })
      return
    }

    if (voter.hasVoted) {
      socket.emit('error', {
        code: ErrorCodes.ALREADY_VOTED,
        message: 'Ya has votado',
      })
      return
    }

    const target = room.players.find((p) => p.id === targetId)
    if (!target || target.isEliminated) {
      socket.emit('error', {
        code: ErrorCodes.INVALID_VOTE_TARGET,
        message: 'Objetivo de voto inválido',
      })
      return
    }

    voter.hasVoted = true
    voter.votedFor = targetId
    room.lastActivity = new Date()

    // Calculate votes
    const activePlayers = room.players.filter((p) => !p.isEliminated)
    const votes: Record<string, string> = {}
    let voteCounts: Record<string, number> = {}

    for (const p of activePlayers) {
      if (p.hasVoted && p.votedFor) {
        votes[p.id] = p.votedFor
        voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + 1
      }
    }

    // Check if 2/3 reached for any player
    const threshold = Math.ceil((activePlayers.length * 2) / 3)
    const twoThirdsReached = Object.values(voteCounts).some((c) => c >= threshold)

    io.to(room.id).emit('vote:update', { votes, twoThirdsReached })
  })

  // Confirm elimination (admin only)
  socket.on('vote:confirm', ({ eliminate }) => {
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
        message: 'Solo el admin puede confirmar',
      })
      return
    }

    if (room.status !== 'voting') {
      socket.emit('error', {
        code: 'INVALID_STATE',
        message: 'No hay votación en curso',
      })
      return
    }

    if (!eliminate) {
      // Continue playing without elimination
      room.status = 'playing'
      room.lastActivity = new Date()

      // Reset votes
      for (const player of room.players) {
        player.hasVoted = false
        player.votedFor = undefined
      }

      io.to(room.id).emit('vote:result', {})
      return
    }

    // Find player with most votes
    const activePlayers = room.players.filter((p) => !p.isEliminated)
    const voteCounts: Record<string, number> = {}

    for (const p of activePlayers) {
      if (p.votedFor) {
        voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + 1
      }
    }

    // Get player with most votes
    let maxVotes = 0
    let eliminatedId: string | null = null

    for (const [playerId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count
        eliminatedId = playerId
      }
    }

    if (!eliminatedId) {
      // No votes, continue without elimination
      room.status = 'playing'
      io.to(room.id).emit('vote:result', {})
      return
    }

    // Eliminate player
    const eliminated = room.players.find((p) => p.id === eliminatedId)
    if (eliminated) {
      eliminated.isEliminated = true
    }

    const wasImpostor = eliminatedId === room.impostorId
    room.lastActivity = new Date()

    // Check win conditions
    const remainingActive = room.players.filter((p) => !p.isEliminated)
    const impostorEliminated = wasImpostor
    const impostorRemains = remainingActive.some((p) => p.id === room.impostorId)

    if (impostorEliminated) {
      // Crew wins!
      room.status = 'finished'
      io.to(room.id).emit('vote:result', { eliminated: eliminatedId, wasImpostor: true })
      io.to(room.id).emit('game:ended', { winner: 'crew', impostorId: room.impostorId! })
      console.log(`Game ended in ${room.code}: Crew wins!`)
    } else if (remainingActive.length <= 2 && impostorRemains) {
      // Impostor wins! (only 2 players left including impostor)
      room.status = 'finished'
      io.to(room.id).emit('vote:result', { eliminated: eliminatedId, wasImpostor: false })
      io.to(room.id).emit('game:ended', { winner: 'impostor', impostorId: room.impostorId! })
      console.log(`Game ended in ${room.code}: Impostor wins!`)
    } else {
      // Game continues
      room.status = 'playing'

      // Reset votes for next round
      for (const player of room.players) {
        player.hasVoted = false
        player.votedFor = undefined
      }

      io.to(room.id).emit('vote:result', { eliminated: eliminatedId, wasImpostor: false })
    }
  })
}
