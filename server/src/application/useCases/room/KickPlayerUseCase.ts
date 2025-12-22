import { Room } from '../../../domain/entities/Room.js'
import { NotAdminError, RoomNotFoundError, PlayerNotFoundError } from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface KickPlayerInput {
  adminId: string
  targetId: string
}

export interface KickPlayerOutput {
  room: Room
}

export class KickPlayerUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: KickPlayerInput): Promise<KickPlayerOutput> {
    const room = await this.roomRepository.findByPlayerId(input.adminId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (!room.isAdmin(input.adminId)) {
      throw new NotAdminError()
    }

    if (input.adminId === input.targetId) {
      throw new PlayerNotFoundError() // Can't kick yourself
    }

    if (!room.hasPlayer(input.targetId)) {
      throw new PlayerNotFoundError()
    }

    const updatedRoom = room.removePlayer(input.targetId)
    await this.roomRepository.save(updatedRoom)

    return { room: updatedRoom }
  }
}
