import { Room } from '../../../domain/entities/Room.js'
import {
  RoomNotFoundError,
  NotAdminError,
  InvalidStateError,
  NotEnoughPlayersError,
} from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface ForceStartRouletteInput {
  adminId: string
}

export interface ForceStartRouletteOutput {
  room: Room
  word: string
  impostorIds: string[]
}

export class ForceStartRouletteUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: ForceStartRouletteInput): Promise<ForceStartRouletteOutput> {
    const room = await this.roomRepository.findByPlayerId(input.adminId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (!room.isAdmin(input.adminId)) {
      throw new NotAdminError()
    }

    if (room.status !== 'collecting_words') {
      throw new InvalidStateError('Not in collecting words state')
    }

    if (!room.canStartFromCollecting()) {
      throw new NotEnoughPlayersError(room.minWordsRequired)
    }

    const updatedRoom = room.startGameFromCollecting()
    await this.roomRepository.save(updatedRoom)

    return {
      room: updatedRoom,
      word: updatedRoom.currentWord!,
      impostorIds: updatedRoom.impostorIds,
    }
  }
}
