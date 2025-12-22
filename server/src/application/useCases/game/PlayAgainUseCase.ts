import { Room } from '../../../domain/entities/Room.js'
import { RoomNotFoundError, NotAdminError, InvalidStateError } from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface PlayAgainInput {
  adminId: string
}

export interface PlayAgainOutput {
  room: Room
}

export class PlayAgainUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: PlayAgainInput): Promise<PlayAgainOutput> {
    const room = await this.roomRepository.findByPlayerId(input.adminId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (!room.isAdmin(input.adminId)) {
      throw new NotAdminError()
    }

    if (room.status !== 'finished') {
      throw new InvalidStateError('Game is not finished')
    }

    const updatedRoom = room.resetToLobby()
    await this.roomRepository.save(updatedRoom)

    return { room: updatedRoom }
  }
}
