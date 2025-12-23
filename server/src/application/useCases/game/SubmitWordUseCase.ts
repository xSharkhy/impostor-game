import { Room } from '../../../domain/entities/Room.js'
import {
  RoomNotFoundError,
  InvalidStateError,
} from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface SubmitWordInput {
  playerId: string
  word: string
}

export interface SubmitWordOutput {
  room: Room
  wordCount: number
  allSubmitted: boolean
}

export class SubmitWordUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: SubmitWordInput): Promise<SubmitWordOutput> {
    const room = await this.roomRepository.findByPlayerId(input.playerId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (room.status !== 'collecting_words') {
      throw new InvalidStateError('Not in collecting words state')
    }

    if (!input.word?.trim()) {
      throw new InvalidStateError('Word is required')
    }

    const updatedRoom = room.submitWord(input.playerId, input.word.trim())
    await this.roomRepository.save(updatedRoom)

    return {
      room: updatedRoom,
      wordCount: updatedRoom.wordCount,
      allSubmitted: updatedRoom.allPlayersSubmitted(),
    }
  }
}
