import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import 'dotenv/config'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { authMiddleware, type AuthenticatedSocket } from './middleware/auth.js'

const app = express()
const httpServer = createServer(app)

// CORS configuration for Vercel frontend
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}))

app.use(express.json())

// Socket.io with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
  // Use uWebSockets.js for better performance
  // wsEngine: require('uWebSockets.js').WebSocket, // Enable when needed
})

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth middleware
io.use(authMiddleware)

// Socket.io connection handler
io.on('connection', (socket) => {
  const authSocket = socket as AuthenticatedSocket
  console.log(`Client connected: ${authSocket.user.displayName} (${authSocket.user.id})`)

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${authSocket.user.displayName}`)
  })

  // Room events will be added in Phase 3
  // Game events will be added in Phase 4
  // Voting events will be added in Phase 5
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
})

export { io }
