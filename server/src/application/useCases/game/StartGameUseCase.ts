import { Room } from '../../../domain/entities/Room.js'
import {
  RoomNotFoundError,
  NotAdminError,
  NotEnoughPlayersError,
  GameAlreadyStartedError,
} from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'
import { IWordRepository } from '../../ports/repositories/IWordRepository.js'

export interface StartGameInput {
  adminId: string
  categoryId?: string
}

export interface StartGameOutput {
  room: Room
  word: string
  category: string
  impostorId: string
}

export class StartGameUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly wordRepository: IWordRepository
  ) {}

  async execute(input: StartGameInput): Promise<StartGameOutput> {
    const room = await this.roomRepository.findByPlayerId(input.adminId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (!room.isAdmin(input.adminId)) {
      throw new NotAdminError()
    }

    if (room.status !== 'lobby') {
      throw new GameAlreadyStartedError()
    }

    if (room.playerCount < 3) {
      throw new NotEnoughPlayersError(3)
    }

    // Get random word filtered by room language
    const wordResult = await this.wordRepository.getRandomWord(input.categoryId, room.language)
    if (!wordResult) {
      throw new Error('No words available')
    }

    // Start game - Room internally selects impostor
    const updatedRoom = room.startGame(wordResult.word, wordResult.categoryName)

    await this.roomRepository.save(updatedRoom)

    return {
      room: updatedRoom,
      word: wordResult.word,
      category: wordResult.categoryName,
      impostorId: updatedRoom.impostorId!,
    }
  }
}
