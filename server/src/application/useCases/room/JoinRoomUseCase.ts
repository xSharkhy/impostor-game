import { Room } from '../../../domain/entities/Room.js'
import { RoomNotFoundError, AlreadyInRoomError } from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface JoinRoomInput {
  code: string
  userId: string
  displayName: string
}

export interface JoinRoomOutput {
  room: Room
  isReconnect: boolean
}

export class JoinRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: JoinRoomInput): Promise<JoinRoomOutput> {
    // Check if user is already in another room
    const existingRoom = await this.roomRepository.findByPlayerId(input.userId)
    if (existingRoom && existingRoom.code.toUpperCase() !== input.code.toUpperCase()) {
      throw new AlreadyInRoomError()
    }

    // Find room by code
    const room = await this.roomRepository.findByCode(input.code.toUpperCase())
    if (!room) {
      throw new RoomNotFoundError()
    }

    // Check if reconnecting
    const isReconnect = room.hasPlayer(input.userId)

    // Add player (handles both new join and reconnect)
    const updatedRoom = room.addPlayer(input.userId, input.displayName)

    await this.roomRepository.save(updatedRoom)

    return { room: updatedRoom, isReconnect }
  }
}
