import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import type { Container } from '../../../../config/container.js'
import type { AuthenticatedSocket } from './RoomHandler.js'
import { RoomMapper } from '../../../../application/dto/RoomDTO.js'

export function createUserHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  container: Container
) {
  const { roomRepository } = container

  return function registerUserHandlers(socket: AuthenticatedSocket) {
    const { user } = socket

    // Update display name
    socket.on('user:updateDisplayName', async ({ displayName }) => {
      if (!displayName || displayName.trim().length < 2 || displayName.trim().length > 20) {
        return
      }

      const trimmedName = displayName.trim()

      // Update socket user cache
      user.displayName = trimmedName

      // Update in room if player is in one
      const room = await roomRepository.findByPlayerId(user.id)

      if (room) {
        // Update player name in room (immutable update)
        const updatedRoom = room.updatePlayerDisplayName(user.id, trimmedName)
        await roomRepository.save(updatedRoom)

        // Notify all players in the room with updated room state
        io.to(room.id).emit('room:state', RoomMapper.toDTO(updatedRoom, user.id) as any)
      }

      console.log(`User ${user.id} updated display name to "${trimmedName}"`)
    })
  }
}
