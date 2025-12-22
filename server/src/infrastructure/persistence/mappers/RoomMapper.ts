import { Room, RoomProps, RoomStatus, WinCondition } from '../../../domain/entities/Room.js'
import { PlayerProps } from '../../../domain/entities/Player.js'

/**
 * Database row types for Supabase
 */
export interface RoomRow {
  id: string
  code: string
  admin_id: string
  status: string
  current_word: string | null
  impostor_id: string | null
  turn_order: string[] | null
  current_round: number
  category: string | null
  win_condition: string | null
  created_at: string
  last_activity: string
}

export interface RoomPlayerRow {
  id: string
  room_id: string
  user_id: string
  display_name: string
  is_connected: boolean
  is_eliminated: boolean
  has_voted: boolean
  voted_for: string | null
  joined_at: string
}

/**
 * Maps between database rows and domain entities
 */
export class RoomPersistenceMapper {
  /**
   * Convert database rows to domain Room entity
   */
  static toDomain(roomRow: RoomRow, playerRows: RoomPlayerRow[]): Room {
    const players: PlayerProps[] = playerRows.map((p) => ({
      id: p.user_id,
      displayName: p.display_name,
      isConnected: p.is_connected,
      isEliminated: p.is_eliminated,
      hasVoted: p.has_voted,
      votedFor: p.voted_for ?? undefined,
    }))

    const props: RoomProps = {
      id: roomRow.id,
      code: roomRow.code,
      adminId: roomRow.admin_id,
      status: roomRow.status as RoomStatus,
      players,
      currentWord: roomRow.current_word ?? undefined,
      impostorId: roomRow.impostor_id ?? undefined,
      turnOrder: roomRow.turn_order ?? undefined,
      currentRound: roomRow.current_round,
      category: roomRow.category ?? undefined,
      winCondition: roomRow.win_condition as WinCondition | undefined,
      createdAt: new Date(roomRow.created_at),
      lastActivity: new Date(roomRow.last_activity),
    }

    return Room.fromProps(props)
  }

  /**
   * Convert domain Room entity to database rows
   */
  static toPersistence(room: Room): { roomRow: Omit<RoomRow, 'created_at'>; playerRows: Omit<RoomPlayerRow, 'id' | 'joined_at'>[] } {
    const props = room.toProps()

    const roomRow: Omit<RoomRow, 'created_at'> = {
      id: props.id,
      code: props.code,
      admin_id: props.adminId,
      status: props.status,
      current_word: props.currentWord ?? null,
      impostor_id: props.impostorId ?? null,
      turn_order: props.turnOrder ?? null,
      current_round: props.currentRound,
      category: props.category ?? null,
      win_condition: props.winCondition ?? null,
      last_activity: new Date().toISOString(),
    }

    const playerRows: Omit<RoomPlayerRow, 'id' | 'joined_at'>[] = props.players.map((p) => ({
      room_id: props.id,
      user_id: p.id,
      display_name: p.displayName,
      is_connected: p.isConnected ?? true,
      is_eliminated: p.isEliminated ?? false,
      has_voted: p.hasVoted ?? false,
      voted_for: p.votedFor ?? null,
    }))

    return { roomRow, playerRows }
  }
}
