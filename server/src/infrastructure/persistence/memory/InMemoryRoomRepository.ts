import { Room } from '../../../domain/entities/Room.js'
import { RoomId, RoomCode } from '../../../domain/entities/Room.js'
import { PlayerId } from '../../../domain/entities/Player.js'
import { IRoomRepository } from '../../../application/ports/repositories/IRoomRepository.js'

/**
 * In-memory implementation of IRoomRepository
 * Stores rooms in memory (as per original plan)
 * No database required for rooms
 */
export class InMemoryRoomRepository implements IRoomRepository {
  private rooms: Map<RoomId, Room> = new Map()
  private codeToId: Map<RoomCode, RoomId> = new Map()
  private playerToRoom: Map<PlayerId, RoomId> = new Map()

  async findById(id: RoomId): Promise<Room | null> {
    return this.rooms.get(id) ?? null
  }

  async findByCode(code: RoomCode): Promise<Room | null> {
    const roomId = this.codeToId.get(code.toUpperCase())
    if (!roomId) return null
    return this.rooms.get(roomId) ?? null
  }

  async findByPlayerId(playerId: PlayerId): Promise<Room | null> {
    const roomId = this.playerToRoom.get(playerId)
    if (!roomId) return null
    return this.rooms.get(roomId) ?? null
  }

  async save(room: Room): Promise<void> {
    // Update indexes
    this.rooms.set(room.id, room)
    this.codeToId.set(room.code.toUpperCase(), room.id)

    // Update player-to-room mapping
    for (const player of room.players) {
      this.playerToRoom.set(player.id, room.id)
    }

    // Remove players who are no longer in the room
    for (const [playerId, roomId] of this.playerToRoom.entries()) {
      if (roomId === room.id && !room.hasPlayer(playerId)) {
        this.playerToRoom.delete(playerId)
      }
    }
  }

  async delete(id: RoomId): Promise<void> {
    const room = this.rooms.get(id)
    if (!room) return

    // Clean up indexes
    this.codeToId.delete(room.code.toUpperCase())

    // Remove all player mappings for this room
    for (const player of room.players) {
      this.playerToRoom.delete(player.id)
    }

    this.rooms.delete(id)
  }

  async countActive(): Promise<number> {
    let count = 0
    for (const room of this.rooms.values()) {
      if (room.status !== 'finished') {
        count++
      }
    }
    return count
  }

  async isCodeTaken(code: RoomCode): Promise<boolean> {
    return this.codeToId.has(code.toUpperCase())
  }

  async findInactive(since: Date): Promise<Room[]> {
    const inactive: Room[] = []
    for (const room of this.rooms.values()) {
      if (room.lastActivity < since) {
        inactive.push(room)
      }
    }
    return inactive
  }

  /**
   * Cleanup inactive rooms (call periodically)
   */
  async cleanupInactive(maxAgeMs: number = 5 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMs)
    const inactive = await this.findInactive(cutoff)

    for (const room of inactive) {
      await this.delete(room.id)
    }

    return inactive.length
  }
}
