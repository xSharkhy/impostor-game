import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import { Room } from '../../../domain/entities/Room.js'
import { RoomPersistenceMapper, RoomRow, RoomPlayerRow } from '../mappers/RoomMapper.js'

export type RoomChangeCallback = (room: Room, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
export type PlayerChangeCallback = (
  roomId: string,
  playerId: string,
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
) => void

/**
 * Subscribes to Supabase Realtime changes for rooms and players
 */
export class SupabaseRealtimeSubscriber {
  private roomChannel: RealtimeChannel | null = null
  private playerChannel: RealtimeChannel | null = null
  private roomCallbacks: Set<RoomChangeCallback> = new Set()
  private playerCallbacks: Set<PlayerChangeCallback> = new Set()

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Start listening to room changes
   */
  subscribeToRooms(): void {
    if (this.roomChannel) {
      return
    }

    this.roomChannel = this.supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        async (payload) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'

          if (eventType === 'DELETE') {
            // For deletes, we don't have the full room, notify with minimal info
            const roomId = (payload.old as RoomRow).id
            // Create a minimal room representation for delete events
            for (const callback of this.roomCallbacks) {
              // Notify listeners about deletion - they should handle cleanup
              callback(null as unknown as Room, eventType)
            }
            return
          }

          const roomRow = payload.new as RoomRow

          // Fetch players for this room
          const { data: playerRows } = await this.supabase
            .from('room_players')
            .select('*')
            .eq('room_id', roomRow.id)

          const room = RoomPersistenceMapper.toDomain(
            roomRow,
            (playerRows ?? []) as RoomPlayerRow[]
          )

          for (const callback of this.roomCallbacks) {
            callback(room, eventType)
          }
        }
      )
      .subscribe()
  }

  /**
   * Start listening to player changes
   */
  subscribeToPlayers(): void {
    if (this.playerChannel) {
      return
    }

    this.playerChannel = this.supabase
      .channel('players-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
        },
        (payload) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
          const row = (eventType === 'DELETE' ? payload.old : payload.new) as RoomPlayerRow

          for (const callback of this.playerCallbacks) {
            callback(row.room_id, row.user_id, eventType)
          }
        }
      )
      .subscribe()
  }

  /**
   * Register a callback for room changes
   */
  onRoomChange(callback: RoomChangeCallback): () => void {
    this.roomCallbacks.add(callback)
    return () => this.roomCallbacks.delete(callback)
  }

  /**
   * Register a callback for player changes
   */
  onPlayerChange(callback: PlayerChangeCallback): () => void {
    this.playerCallbacks.add(callback)
    return () => this.playerCallbacks.delete(callback)
  }

  /**
   * Subscribe to a specific room's changes
   */
  subscribeToRoom(roomId: string, callback: (room: Room) => void): () => void {
    const channel = this.supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            return
          }

          const roomRow = payload.new as RoomRow
          const { data: playerRows } = await this.supabase
            .from('room_players')
            .select('*')
            .eq('room_id', roomId)

          const room = RoomPersistenceMapper.toDomain(
            roomRow,
            (playerRows ?? []) as RoomPlayerRow[]
          )
          callback(room)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // When players change, fetch the full room
          const { data: roomRow } = await this.supabase
            .from('rooms')
            .select('*')
            .eq('id', roomId)
            .single()

          if (!roomRow) return

          const { data: playerRows } = await this.supabase
            .from('room_players')
            .select('*')
            .eq('room_id', roomId)

          const room = RoomPersistenceMapper.toDomain(
            roomRow as RoomRow,
            (playerRows ?? []) as RoomPlayerRow[]
          )
          callback(room)
        }
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    if (this.roomChannel) {
      this.supabase.removeChannel(this.roomChannel)
      this.roomChannel = null
    }

    if (this.playerChannel) {
      this.supabase.removeChannel(this.playerChannel)
      this.playerChannel = null
    }

    this.roomCallbacks.clear()
    this.playerCallbacks.clear()
  }
}
