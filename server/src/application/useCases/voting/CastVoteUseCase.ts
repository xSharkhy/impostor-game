import { Room } from '../../../domain/entities/Room.js'
import {
  RoomNotFoundError,
  InvalidStateError,
  InvalidVoteTargetError,
  AlreadyVotedError,
  PlayerNotFoundError,
} from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface CastVoteInput {
  voterId: string
  targetId: string
}

export interface CastVoteOutput {
  room: Room
  allVoted: boolean
}

export class CastVoteUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: CastVoteInput): Promise<CastVoteOutput> {
    const room = await this.roomRepository.findByPlayerId(input.voterId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (room.status !== 'voting') {
      throw new InvalidStateError('Game must be in voting state')
    }

    const voter = room.getPlayer(input.voterId)
    if (!voter) {
      throw new PlayerNotFoundError()
    }

    if (voter.isEliminated) {
      throw new InvalidStateError('Eliminated players cannot vote')
    }

    if (voter.hasVoted) {
      throw new AlreadyVotedError()
    }

    // Validate target
    const target = room.getPlayer(input.targetId)
    if (!target) {
      throw new InvalidVoteTargetError()
    }

    if (target.isEliminated) {
      throw new InvalidVoteTargetError()
    }

    if (input.voterId === input.targetId) {
      throw new InvalidVoteTargetError()
    }

    const updatedRoom = room.castVote(input.voterId, input.targetId)
    await this.roomRepository.save(updatedRoom)

    // Check if all active players have voted
    const activePlayers = updatedRoom.activePlayers
    const allVoted = activePlayers.every((p) => p.hasVoted)

    return { room: updatedRoom, allVoted }
  }
}
