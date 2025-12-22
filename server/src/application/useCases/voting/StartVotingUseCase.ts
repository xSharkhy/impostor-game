import { Room } from '../../../domain/entities/Room.js'
import { RoomNotFoundError, NotAdminError, InvalidStateError } from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface StartVotingInput {
  adminId: string
}

export interface StartVotingOutput {
  room: Room
}

export class StartVotingUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: StartVotingInput): Promise<StartVotingOutput> {
    const room = await this.roomRepository.findByPlayerId(input.adminId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (!room.isAdmin(input.adminId)) {
      throw new NotAdminError()
    }

    if (room.status !== 'playing') {
      throw new InvalidStateError('Game must be in playing state to start voting')
    }

    const updatedRoom = room.startVoting()
    await this.roomRepository.save(updatedRoom)

    return { room: updatedRoom }
  }
}
