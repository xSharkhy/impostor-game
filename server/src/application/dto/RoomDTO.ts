import { Room, WinCondition } from '../../domain/entities/Room.js'
import { Player } from '../../domain/entities/Player.js'

export interface PlayerDTO {
  id: string
  displayName: string
  isConnected: boolean
  isEliminated: boolean
  hasVoted: boolean
}

export interface RoomDTO {
  id: string
  code: string
  adminId: string
  status: 'lobby' | 'playing' | 'voting' | 'finished'
  players: PlayerDTO[]
  currentRound: number
  category: string | null
  currentWord: string | null // Only sent to non-impostors
  impostorId: string | null // Only sent to the impostor
  turnOrder: string[]
  currentTurnIndex: number
  winCondition: WinCondition | null
}

export class RoomMapper {
  static toDTO(room: Room, forPlayerId?: string): RoomDTO {
    const isImpostor = forPlayerId === room.impostorId
    const isFinished = room.status === 'finished'

    return {
      id: room.id,
      code: room.code,
      adminId: room.adminId,
      status: room.status,
      players: room.players.map((p) => this.playerToDTO(p)),
      currentRound: room.currentRound,
      category: room.category ?? null,
      // Only reveal word to non-impostors during game, or to everyone after game ends
      currentWord: isFinished || !isImpostor ? (room.currentWord ?? null) : null,
      // Only reveal impostor to themselves during game, or to everyone after game ends
      impostorId: isFinished || isImpostor ? (room.impostorId ?? null) : null,
      turnOrder: room.turnOrder ?? [],
      currentTurnIndex: room.currentTurnIndex,
      winCondition: room.winCondition ?? null,
    }
  }

  static playerToDTO(player: Player): PlayerDTO {
    return {
      id: player.id,
      displayName: player.displayName,
      isConnected: player.isConnected,
      isEliminated: player.isEliminated,
      hasVoted: player.hasVoted,
    }
  }

  /**
   * Creates a sanitized DTO safe to broadcast to all players
   * (no sensitive data like word or impostor)
   */
  static toPublicDTO(room: Room): Omit<RoomDTO, 'currentWord' | 'impostorId'> {
    return {
      id: room.id,
      code: room.code,
      adminId: room.adminId,
      status: room.status,
      players: room.players.map((p) => this.playerToDTO(p)),
      currentRound: room.currentRound,
      category: room.category ?? null,
      turnOrder: room.turnOrder ?? [],
      currentTurnIndex: room.currentTurnIndex,
      winCondition: room.winCondition ?? null,
    }
  }
}
