import type { GameMode } from '@impostor/shared'
import { Room } from '../../../domain/entities/Room.js'
import {
  RoomNotFoundError,
  NotAdminError,
  NotEnoughPlayersError,
  GameAlreadyStartedError,
} from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'
import { IWordRepository } from '../../ports/repositories/IWordRepository.js'
import type { IRandomWordService } from '../../../infrastructure/services/RaeApiService.js'

export interface StartGameInput {
  adminId: string
  mode?: GameMode
  categoryId?: string
}

export interface StartGameOutput {
  room: Room
  word: string
  category: string
  mode: GameMode
  impostorId: string
}

export class StartGameUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly wordRepository: IWordRepository,
    private readonly randomWordService?: IRandomWordService
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

    const mode = input.mode || 'classic'
    let word: string
    let category: string

    if (mode === 'random') {
      // Get random word from RAE API
      if (!this.randomWordService) {
        throw new Error('Random word service not available')
      }

      const result = await this.randomWordService.getRandomWord()
      if (!result) {
        throw new Error('Could not fetch random word from RAE API')
      }

      word = result.word
      category = 'RAE'
    } else {
      // Classic mode: get word from database
      const wordResult = await this.wordRepository.getRandomWord(input.categoryId, room.language)
      if (!wordResult) {
        throw new Error('No words available')
      }

      word = wordResult.word
      category = wordResult.categoryName
    }

    // Start game - Room internally selects impostor
    const updatedRoom = room.startGame(word, category)

    await this.roomRepository.save(updatedRoom)

    return {
      room: updatedRoom,
      word,
      category,
      mode,
      impostorId: updatedRoom.impostorId!,
    }
  }
}
