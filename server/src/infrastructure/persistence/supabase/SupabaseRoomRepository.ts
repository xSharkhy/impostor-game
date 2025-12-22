import { SupabaseClient } from '@supabase/supabase-js'
import { Room } from '../../../domain/entities/Room.js'
import { RoomId, RoomCode } from '../../../domain/entities/Room.js'
import { PlayerId } from '../../../domain/entities/Player.js'
import { IRoomRepository } from '../../../application/ports/repositories/IRoomRepository.js'
import { RoomPersistenceMapper, RoomRow, RoomPlayerRow } from '../mappers/RoomMapper.js'

export class SupabaseRoomRepository implements IRoomRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: RoomId): Promise<Room | null> {
    const { data: roomRow, error: roomError } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()

    if (roomError || !roomRow) {
      return null
    }

    const { data: playerRows, error: playerError } = await this.supabase
      .from('room_players')
      .select('*')
      .eq('room_id', id)

    if (playerError) {
      return null
    }

    return RoomPersistenceMapper.toDomain(roomRow as RoomRow, (playerRows ?? []) as RoomPlayerRow[])
  }

  async findByCode(code: RoomCode): Promise<Room | null> {
    const { data: roomRow, error: roomError } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (roomError || !roomRow) {
      return null
    }

    const { data: playerRows, error: playerError } = await this.supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomRow.id)

    if (playerError) {
      return null
    }

    return RoomPersistenceMapper.toDomain(roomRow as RoomRow, (playerRows ?? []) as RoomPlayerRow[])
  }

  async findByPlayerId(playerId: PlayerId): Promise<Room | null> {
    // First find the room_player entry
    const { data: playerEntry, error: playerError } = await this.supabase
      .from('room_players')
      .select('room_id')
      .eq('user_id', playerId)
      .single()

    if (playerError || !playerEntry) {
      return null
    }

    return this.findById(playerEntry.room_id)
  }

  async save(room: Room): Promise<void> {
    const { roomRow, playerRows } = RoomPersistenceMapper.toPersistence(room)

    // Upsert room
    const { error: roomError } = await this.supabase
      .from('rooms')
      .upsert({
        ...roomRow,
        created_at: room.createdAt.toISOString(),
      })

    if (roomError) {
      throw new Error(`Failed to save room: ${roomError.message}`)
    }

    // Get existing players for this room
    const { data: existingPlayers } = await this.supabase
      .from('room_players')
      .select('user_id')
      .eq('room_id', room.id)

    const existingPlayerIds = new Set((existingPlayers ?? []).map((p) => p.user_id))
    const currentPlayerIds = new Set(playerRows.map((p) => p.user_id))

    // Delete players who left
    const playersToDelete = [...existingPlayerIds].filter((id) => !currentPlayerIds.has(id))
    if (playersToDelete.length > 0) {
      await this.supabase
        .from('room_players')
        .delete()
        .eq('room_id', room.id)
        .in('user_id', playersToDelete)
    }

    // Upsert current players
    for (const playerRow of playerRows) {
      const { error: playerError } = await this.supabase
        .from('room_players')
        .upsert(
          {
            ...playerRow,
            joined_at: new Date().toISOString(),
          },
          {
            onConflict: 'room_id,user_id',
          }
        )

      if (playerError) {
        throw new Error(`Failed to save player: ${playerError.message}`)
      }
    }
  }

  async delete(id: RoomId): Promise<void> {
    // Players are deleted via CASCADE
    const { error } = await this.supabase.from('rooms').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete room: ${error.message}`)
    }
  }

  async countActive(): Promise<number> {
    const { count, error } = await this.supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'finished')

    if (error) {
      throw new Error(`Failed to count rooms: ${error.message}`)
    }

    return count ?? 0
  }

  async isCodeTaken(code: RoomCode): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (error && error.code === 'PGRST116') {
      // PGRST116 = no rows returned
      return false
    }

    return !!data
  }

  async findInactive(since: Date): Promise<Room[]> {
    const { data: roomRows, error } = await this.supabase
      .from('rooms')
      .select('*')
      .lt('last_activity', since.toISOString())

    if (error || !roomRows) {
      return []
    }

    const rooms: Room[] = []
    for (const roomRow of roomRows) {
      const { data: playerRows } = await this.supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomRow.id)

      rooms.push(
        RoomPersistenceMapper.toDomain(roomRow as RoomRow, (playerRows ?? []) as RoomPlayerRow[])
      )
    }

    return rooms
  }
}
