import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import type { AuthenticatedSocket } from '../middleware/auth.js'
import { registerRoomHandlers } from './handlers/room.js'
import { registerGameHandlers } from './handlers/game.js'
import { registerVotingHandlers } from './handlers/voting.js'
import { registerWordHandlers } from './handlers/words.js'

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) {
  registerRoomHandlers(io, socket)
  registerGameHandlers(io, socket)
  registerVotingHandlers(io, socket)
  registerWordHandlers(io, socket)
}
