/**
 * El Impostor - Server Entry Point
 *
 * Clean Architecture Composition Root
 * All dependencies are created and wired here
 */
import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import 'dotenv/config'

// Config
import { env, createContainer } from './config/index.js'

// Infrastructure - Web
import { createSocketServer } from './infrastructure/web/socket/index.js'
import { createAdminController, createHealthController } from './infrastructure/web/rest/index.js'

// Initialize DI Container
const container = createContainer()

// Create Express app
const app = express()
const httpServer = createServer(app)

// CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  env.clientUrl,
].filter(Boolean) as string[]

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}))

app.use(express.json())

// REST Controllers
app.use('/health', createHealthController())
app.use('/api/admin', createAdminController(container))

// Socket.io Server with Clean Architecture handlers
const io = createSocketServer(httpServer, {
  allowedOrigins: ALLOWED_ORIGINS,
  container,
})

// Start server
httpServer.listen(env.port, () => {
  console.log(`🎮 El Impostor server running on port ${env.port}`)
  console.log(`📡 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
  console.log(`🏗️  Architecture: Clean Architecture`)
})

// Periodic cleanup of inactive rooms (every 60 seconds)
// Rooms are deleted after 5 minutes of inactivity
const CLEANUP_INTERVAL_MS = 60 * 1000
const ROOM_MAX_INACTIVE_MS = 5 * 60 * 1000

setInterval(async () => {
  const roomRepo = container.roomRepository as any
  if (typeof roomRepo.cleanupInactive === 'function') {
    const cleaned = await roomRepo.cleanupInactive(ROOM_MAX_INACTIVE_MS)
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} inactive room(s)`)
    }
  }
}, CLEANUP_INTERVAL_MS)

export { io }
