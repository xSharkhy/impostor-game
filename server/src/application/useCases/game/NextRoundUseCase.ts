import { Room } from '../../../domain/entities/Room.js'
import { RoomNotFoundError, InvalidStateError } from '../../../domain/errors/DomainError.js'
import { IRoomRepository } from '../../ports/repositories/IRoomRepository.js'

export interface NextRoundInput {
  playerId: string
}

export interface NextRoundOutput {
  room: Room
  currentPlayerId: string
}

export class NextRoundUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: NextRoundInput): Promise<NextRoundOutput> {
    const room = await this.roomRepository.findByPlayerId(input.playerId)
    if (!room) {
      throw new RoomNotFoundError()
    }

    if (room.status !== 'playing') {
      throw new InvalidStateError('Game is not in playing state')
    }

    const updatedRoom = room.nextRound()
    await this.roomRepository.save(updatedRoom)

    const currentPlayer = updatedRoom.getCurrentPlayer()
    if (!currentPlayer) {
      throw new InvalidStateError('No current player found')
    }

    return {
      room: updatedRoom,
      currentPlayerId: currentPlayer.id,
    }
  }
}
