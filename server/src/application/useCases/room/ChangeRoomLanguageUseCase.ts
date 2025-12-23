import { Room, RoomLanguage } from '../../../domain/entities/Room.js'
import { RoomNotFoundError, NotAdminError } from '../../../domain/errors/DomainError.js'
import type { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface ChangeRoomLanguageInput {
  playerId: string
  language: RoomLanguage
}

export interface ChangeRoomLanguageOutput {
  room: Room
}

export class ChangeRoomLanguageUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: ChangeRoomLanguageInput): Promise<ChangeRoomLanguageOutput> {
    const room = await this.roomRepository.findByPlayerId(input.playerId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (!room.isAdmin(input.playerId)) {
      throw new NotAdminError()
    }

    const updatedRoom = room.changeLanguage(input.language)
    await this.roomRepository.save(updatedRoom)

    return { room: updatedRoom }
  }
}
