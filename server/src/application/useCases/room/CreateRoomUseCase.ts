import { Room } from '../../../domain/entities/Room.js'
import { MaxRoomsReachedError, AlreadyInRoomError } from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

const MAX_ROOMS = 5

export interface CreateRoomInput {
  userId: string
  displayName: string
}

export interface CreateRoomOutput {
  room: Room
}

export class CreateRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    // Check if user is already in a room
    const existingRoom = await this.roomRepository.findByPlayerId(input.userId)
    if (existingRoom) {
      throw new AlreadyInRoomError()
    }

    // Check max rooms limit
    const roomCount = await this.roomRepository.countActive()
    if (roomCount >= MAX_ROOMS) {
      throw new MaxRoomsReachedError()
    }

    // Generate unique code
    let code: string
    do {
      code = Room.generateCode()
    } while (await this.roomRepository.isCodeTaken(code))

    // Create room
    const roomId = crypto.randomUUID()
    const room = Room.create(roomId, code, input.userId, input.displayName)

    await this.roomRepository.save(room)

    return { room }
  }
}
