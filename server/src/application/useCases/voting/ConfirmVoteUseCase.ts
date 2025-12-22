import { Room, WinCondition } from '../../../domain/entities/Room.js'
import { RoomNotFoundError, NotAdminError, InvalidStateError } from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface ConfirmVoteInput {
  adminId: string
}

export interface VoteResultEntry {
  playerId: string
  votes: number
}

export interface ConfirmVoteOutput {
  room: Room
  eliminatedPlayerId: string | null
  isTie: boolean
  voteResults: VoteResultEntry[]
  gameEnded: boolean
  winCondition: WinCondition | null
}

export class ConfirmVoteUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: ConfirmVoteInput): Promise<ConfirmVoteOutput> {
    const room = await this.roomRepository.findByPlayerId(input.adminId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (!room.isAdmin(input.adminId)) {
      throw new NotAdminError()
    }

    if (room.status !== 'voting') {
      throw new InvalidStateError('Game must be in voting state')
    }

    // Calculate votes - returns { voteCounts: Map, twoThirdsReached: boolean }
    const { voteCounts } = room.calculateVotes()

    // Convert Map to sorted array
    const sortedResults: VoteResultEntry[] = Array.from(voteCounts.entries())
      .map(([playerId, votes]) => ({ playerId, votes }))
      .sort((a, b) => b.votes - a.votes)

    // Check for tie
    const topVotes = sortedResults[0]?.votes ?? 0
    const tieCandidates = sortedResults.filter((r) => r.votes === topVotes)
    const isTie = tieCandidates.length > 1 || topVotes === 0

    let updatedRoom: Room
    let eliminatedPlayerId: string | null = null
    let gameEnded = false
    let winCondition: WinCondition | null = null

    if (isTie) {
      // No elimination, continue game
      updatedRoom = room.continueAfterVoting()
    } else {
      // Eliminate player with most votes
      eliminatedPlayerId = sortedResults[0].playerId
      updatedRoom = room.eliminatePlayer(eliminatedPlayerId)

      // Check win condition
      winCondition = updatedRoom.checkWinCondition()
      if (winCondition) {
        updatedRoom = updatedRoom.finishGame(winCondition)
        gameEnded = true
      } else {
        updatedRoom = updatedRoom.continueAfterVoting()
      }
    }

    await this.roomRepository.save(updatedRoom)

    return {
      room: updatedRoom,
      eliminatedPlayerId,
      isTie,
      voteResults: sortedResults,
      gameEnded,
      winCondition,
    }
  }
}
