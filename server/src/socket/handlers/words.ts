import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { wordService } from '../../services/WordService.js'
import { emailService } from '../../services/EmailService.js'
import type { AuthenticatedSocket } from '../../middleware/auth.js'

export function registerWordHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) {
  const { user } = socket

  // Suggest a word
  socket.on('word:suggest', async ({ word, categoryId, lang }) => {
    if (!word || !categoryId) {
      socket.emit('error', {
        code: 'INVALID_INPUT',
        message: 'Palabra y categoría requeridas',
      })
      return
    }

    const result = await wordService.suggestWord(word, categoryId, user.id, lang)

    if (!result.success) {
      socket.emit('error', {
        code: 'SUGGESTION_FAILED',
        message: result.error || 'Error al sugerir palabra',
      })
      return
    }

    // Emit success back to the user
    socket.emit('word:suggested', { word, categoryId })
    console.log(`Word "${word}" suggested by ${user.displayName}`)

    // Send email notification to admin
    emailService.sendNewSuggestionNotification(word, categoryId, user.displayName)
  })
}
