import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import 'dotenv/config'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { authMiddleware, type AuthenticatedSocket, verifyToken } from './middleware/auth.js'
import { registerSocketHandlers } from './socket/index.js'
import { wordService } from './services/WordService.js'

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

// Admin emails (from env or hardcoded)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean)

// Admin middleware
async function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.slice(7)
  const user = await verifyToken(token)

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  ;(req as any).user = user
  next()
}

// Admin API: Get pending word suggestions
app.get('/api/admin/suggestions', requireAdmin, async (_req, res) => {
  const suggestions = await wordService.getPendingSuggestions()
  res.json(suggestions)
})

// Admin API: Approve word
app.post('/api/admin/words/:id/approve', requireAdmin, async (req, res) => {
  const success = await wordService.approveWord(req.params.id)
  if (success) {
    res.json({ success: true })
  } else {
    res.status(500).json({ error: 'Failed to approve word' })
  }
})

// Admin API: Reject word
app.delete('/api/admin/words/:id', requireAdmin, async (req, res) => {
  const success = await wordService.rejectWord(req.params.id)
  if (success) {
    res.json({ success: true })
  } else {
    res.status(500).json({ error: 'Failed to reject word' })
  }
})

// Auth middleware
io.use(authMiddleware)

// Socket.io connection handler
io.on('connection', (socket) => {
  const authSocket = socket as AuthenticatedSocket
  console.log(`Client connected: ${authSocket.user.displayName} (${authSocket.user.id})`)

  // Register all handlers
  registerSocketHandlers(io, authSocket)
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
})

export { io }
