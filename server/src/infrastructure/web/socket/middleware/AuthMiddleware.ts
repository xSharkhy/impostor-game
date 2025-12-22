import type { Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import type { IAuthService } from '../../../../application/ports/services/IAuthService.js'
import type { AuthenticatedSocket } from '../handlers/RoomHandler.js'

export function createAuthMiddleware(authService: IAuthService) {
  return async (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    next: (err?: Error) => void
  ) => {
    try {
      const token = socket.handshake.auth.token as string

      if (!token) {
        return next(new Error('No token provided'))
      }

      const user = await authService.verifyToken(token)

      if (!user) {
        return next(new Error('Invalid token'))
      }

      // Attach user to socket
      ;(socket as AuthenticatedSocket).user = {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
      }

      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  }
}
