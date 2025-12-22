import { Room, RoomId, RoomCode } from '../../../domain/entities/Room.js'
import { PlayerId } from '../../../domain/entities/Player.js'

export interface IRoomRepository {
  /**
   * Find room by ID
   */
  findById(id: RoomId): Promise<Room | null>

  /**
   * Find room by code
   */
  findByCode(code: RoomCode): Promise<Room | null>

  /**
   * Find room that contains a specific player
   */
  findByPlayerId(playerId: PlayerId): Promise<Room | null>

  /**
   * Save room (create or update)
   */
  save(room: Room): Promise<void>

  /**
   * Delete room
   */
  delete(id: RoomId): Promise<void>

  /**
   * Count active rooms
   */
  countActive(): Promise<number>

  /**
   * Check if code is already taken
   */
  isCodeTaken(code: RoomCode): Promise<boolean>

  /**
   * Find rooms inactive for specified duration
   */
  findInactive(since: Date): Promise<Room[]>
}
