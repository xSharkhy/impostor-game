import type { Room, Player, RoomStatus } from '@impostor/shared'
import { CONSTANTS, ErrorCodes } from '@impostor/shared'

// Characters for room codes (excludes confusing chars: 0, O, I, L, 1)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  return Array.from(
    { length: CONSTANTS.CODE_LENGTH },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join('')
}

interface ServerRoom extends Room {
  impostorId?: string // Only on server, never sent to client
}

class RoomManager {
  private rooms: Map<string, ServerRoom> = new Map()
  private playerRooms: Map<string, string> = new Map() // playerId -> roomId
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup inactive rooms every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveRooms()
    }, 60 * 1000)
  }

  createRoom(adminId: string, adminName: string): ServerRoom | { error: string } {
    // Check max rooms limit
    if (this.rooms.size >= CONSTANTS.MAX_ROOMS) {
      return { error: ErrorCodes.MAX_ROOMS_REACHED }
    }

    // Check if player is already in a room
    if (this.playerRooms.has(adminId)) {
      return { error: 'ALREADY_IN_ROOM' }
    }

    // Generate unique code
    let code: string
    do {
      code = generateCode()
    } while (this.getRoomByCode(code))

    const room: ServerRoom = {
      id: crypto.randomUUID(),
      code,
      adminId,
      players: [
        {
          id: adminId,
          displayName: adminName,
          isConnected: true,
          isEliminated: false,
          hasVoted: false,
        },
      ],
      status: 'lobby',
      currentRound: 0,
      createdAt: new Date(),
      lastActivity: new Date(),
    }

    this.rooms.set(room.id, room)
    this.playerRooms.set(adminId, room.id)

    return room
  }

  joinRoom(
    code: string,
    playerId: string,
    playerName: string
  ): ServerRoom | { error: string } {
    const room = this.getRoomByCode(code)

    if (!room) {
      return { error: ErrorCodes.ROOM_NOT_FOUND }
    }

    if (room.status !== 'lobby') {
      return { error: ErrorCodes.GAME_ALREADY_STARTED }
    }

    // Check if player is already in this room
    const existingPlayer = room.players.find((p) => p.id === playerId)
    if (existingPlayer) {
      // Reconnect
      existingPlayer.isConnected = true
      room.lastActivity = new Date()
      return room
    }

    // Check if player is in another room
    if (this.playerRooms.has(playerId)) {
      return { error: 'ALREADY_IN_ROOM' }
    }

    const player: Player = {
      id: playerId,
      displayName: playerName,
      isConnected: true,
      isEliminated: false,
      hasVoted: false,
    }

    room.players.push(player)
    room.lastActivity = new Date()
    this.playerRooms.set(playerId, room.id)

    return room
  }

  leaveRoom(playerId: string): { room: ServerRoom; newAdmin?: string } | null {
    const roomId = this.playerRooms.get(playerId)
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (!room) return null

    // Remove player
    room.players = room.players.filter((p) => p.id !== playerId)
    this.playerRooms.delete(playerId)
    room.lastActivity = new Date()

    // If no players left, delete room
    if (room.players.length === 0) {
      this.rooms.delete(room.id)
      return { room }
    }

    // If admin left, transfer to oldest player
    let newAdmin: string | undefined
    if (room.adminId === playerId) {
      newAdmin = room.players[0].id
      room.adminId = newAdmin
    }

    return { room, newAdmin }
  }

  kickPlayer(
    adminId: string,
    targetId: string
  ): { room: ServerRoom; kicked: boolean } | { error: string } {
    const roomId = this.playerRooms.get(adminId)
    if (!roomId) return { error: ErrorCodes.ROOM_NOT_FOUND }

    const room = this.rooms.get(roomId)
    if (!room) return { error: ErrorCodes.ROOM_NOT_FOUND }

    if (room.adminId !== adminId) {
      return { error: ErrorCodes.NOT_ADMIN }
    }

    if (targetId === adminId) {
      return { error: 'CANNOT_KICK_SELF' }
    }

    const playerIndex = room.players.findIndex((p) => p.id === targetId)
    if (playerIndex === -1) {
      return { error: 'PLAYER_NOT_FOUND' }
    }

    room.players.splice(playerIndex, 1)
    this.playerRooms.delete(targetId)
    room.lastActivity = new Date()

    return { room, kicked: true }
  }

  disconnectPlayer(playerId: string): ServerRoom | null {
    const roomId = this.playerRooms.get(playerId)
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (!room) return null

    const player = room.players.find((p) => p.id === playerId)
    if (player) {
      player.isConnected = false
      room.lastActivity = new Date()
    }

    return room
  }

  reconnectPlayer(playerId: string): ServerRoom | null {
    const roomId = this.playerRooms.get(playerId)
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (!room) return null

    const player = room.players.find((p) => p.id === playerId)
    if (player) {
      player.isConnected = true
      room.lastActivity = new Date()
    }

    return room
  }

  getRoom(roomId: string): ServerRoom | undefined {
    return this.rooms.get(roomId)
  }

  getRoomByCode(code: string): ServerRoom | undefined {
    return Array.from(this.rooms.values()).find(
      (r) => r.code.toUpperCase() === code.toUpperCase()
    )
  }

  getPlayerRoom(playerId: string): ServerRoom | undefined {
    const roomId = this.playerRooms.get(playerId)
    return roomId ? this.rooms.get(roomId) : undefined
  }

  updateRoomStatus(roomId: string, status: RoomStatus): void {
    const room = this.rooms.get(roomId)
    if (room) {
      room.status = status
      room.lastActivity = new Date()
    }
  }

  getRoomCount(): number {
    return this.rooms.size
  }

  private cleanupInactiveRooms(): void {
    const now = Date.now()
    for (const [roomId, room] of this.rooms) {
      const inactive = now - room.lastActivity.getTime() > CONSTANTS.ROOM_TIMEOUT_MS
      const allDisconnected = room.players.every((p) => !p.isConnected)

      if (inactive && allDisconnected) {
        // Remove all player mappings
        for (const player of room.players) {
          this.playerRooms.delete(player.id)
        }
        this.rooms.delete(roomId)
        console.log(`Room ${room.code} cleaned up due to inactivity`)
      }
    }
  }

  // For graceful shutdown
  destroy(): void {
    clearInterval(this.cleanupInterval)
  }
}

// Singleton instance
export const roomManager = new RoomManager()
