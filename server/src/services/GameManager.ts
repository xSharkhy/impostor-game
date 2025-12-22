import { roomManager } from './RoomManager.js'
import { wordService } from './WordService.js'
import { CONSTANTS } from '@impostor/shared'

class GameManager {
  async startGame(
    roomId: string,
    categoryId?: string
  ): Promise<
    | {
        word: string
        impostorId: string
        turnOrder: string[]
      }
    | { error: string }
  > {
    const room = roomManager.getRoom(roomId)

    if (!room) {
      return { error: 'ROOM_NOT_FOUND' }
    }

    if (room.players.length < CONSTANTS.MIN_PLAYERS) {
      return { error: 'NOT_ENOUGH_PLAYERS' }
    }

    if (room.status !== 'lobby') {
      return { error: 'GAME_ALREADY_STARTED' }
    }

    // Get random word
    const wordResult = await wordService.getRandomWord(categoryId)
    if (!wordResult) {
      return { error: 'NO_WORDS_AVAILABLE' }
    }

    // Select random impostor
    const activePlayers = room.players.filter((p) => !p.isEliminated)
    const impostorIndex = Math.floor(Math.random() * activePlayers.length)
    const impostorId = activePlayers[impostorIndex].id

    // Generate random turn order
    const turnOrder = this.shuffleArray(activePlayers.map((p) => p.id))

    // Update room state
    room.status = 'playing'
    room.currentWord = wordResult.word
    room.category = wordResult.category
    room.impostorId = impostorId
    room.turnOrder = turnOrder
    room.currentRound = 1
    room.lastActivity = new Date()

    // Reset player states
    for (const player of room.players) {
      player.hasVoted = false
      player.votedFor = undefined
      player.isEliminated = false
    }

    return {
      word: wordResult.word,
      impostorId,
      turnOrder,
    }
  }

  nextRound(roomId: string): { round: number } | { error: string } {
    const room = roomManager.getRoom(roomId)

    if (!room) {
      return { error: 'ROOM_NOT_FOUND' }
    }

    if (room.status !== 'playing') {
      return { error: 'GAME_NOT_IN_PROGRESS' }
    }

    room.currentRound += 1
    room.lastActivity = new Date()

    // Reset votes for new round
    for (const player of room.players) {
      player.hasVoted = false
      player.votedFor = undefined
    }

    return { round: room.currentRound }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

export const gameManager = new GameManager()
