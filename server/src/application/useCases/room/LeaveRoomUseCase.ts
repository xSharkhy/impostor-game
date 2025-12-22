import { Room } from '../../../domain/entities/Room.js'
import { PlayerId } from '../../../domain/entities/Player.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface LeaveRoomInput {
  userId: string
}

export interface LeaveRoomOutput {
  room: Room | null
  newAdminId?: PlayerId
  wasDeleted: boolean
}

export class LeaveRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: LeaveRoomInput): Promise<LeaveRoomOutput> {
    const room = await this.roomRepository.findByPlayerId(input.userId)
    if (!room) {
      return { room: null, wasDeleted: false }
    }

    const wasAdmin = room.isAdmin(input.userId)
    const updatedRoom = room.removePlayer(input.userId)

    // If no players left, delete the room
    if (updatedRoom.playerCount === 0) {
      await this.roomRepository.delete(room.id)
      return { room: updatedRoom, wasDeleted: true }
    }

    await this.roomRepository.save(updatedRoom)

    return {
      room: updatedRoom,
      newAdminId: wasAdmin ? updatedRoom.adminId : undefined,
      wasDeleted: false,
    }
  }
}
