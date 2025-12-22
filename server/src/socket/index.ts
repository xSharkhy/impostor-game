import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import type { AuthenticatedSocket } from '../middleware/auth.js'
import { registerRoomHandlers } from './handlers/room.js'

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) {
  registerRoomHandlers(io, socket)
  // registerGameHandlers(io, socket) - Phase 4
  // registerVotingHandlers(io, socket) - Phase 5
}
