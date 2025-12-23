import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import type { Container } from '../../../config/container.js'
import { createAuthMiddleware } from './middleware/AuthMiddleware.js'
import {
  createRoomHandler,
  createGameHandler,
  createVotingHandler,
  createWordHandler,
  createUserHandler,
  type AuthenticatedSocket,
} from './handlers/index.js'

export interface SocketServerConfig {
  allowedOrigins: string[]
  container: Container
}

export function createSocketServer(
  httpServer: HttpServer,
  config: SocketServerConfig
): Server<ClientToServerEvents, ServerToClientEvents> {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: config.allowedOrigins,
      credentials: true,
    },
  })

  // Auth middleware
  const authMiddleware = createAuthMiddleware(config.container.authService)
  io.use(authMiddleware)

  // Create handlers
  const roomHandler = createRoomHandler(io, config.container)
  const gameHandler = createGameHandler(io, config.container)
  const votingHandler = createVotingHandler(io, config.container)
  const wordHandler = createWordHandler(io, config.container)
  const userHandler = createUserHandler(io, config.container)

  // Connection handler
  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket
    console.log(`Client connected: ${authSocket.user.displayName} (${authSocket.user.id})`)

    // Register all handlers
    roomHandler(authSocket)
    gameHandler(authSocket)
    votingHandler(authSocket)
    wordHandler(authSocket)
    userHandler(authSocket)
  })

  return io
}
