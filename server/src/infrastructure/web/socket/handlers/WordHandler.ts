import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import type { Container } from '../../../../config/container.js'
import type { AuthenticatedSocket } from './RoomHandler.js'

export function createWordHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  container: Container
) {
  const { getRandomWordUseCase, suggestWordUseCase, emailService } = container

  return function registerWordHandlers(socket: AuthenticatedSocket) {
    const { user } = socket

    // Get categories
    socket.on('word:getCategories', async () => {
      try {
        const result = await getRandomWordUseCase.getCategories()
        socket.emit('word:categories', result.categories)
      } catch (error) {
        console.error('Error getting categories:', error)
        socket.emit('error', {
          code: 'UNKNOWN_ERROR',
          message: 'Error al obtener categorías',
        })
      }
    })

    // Suggest word
    socket.on('word:suggest', async ({ word, categoryId }) => {
      try {
        const result = await suggestWordUseCase.execute({
          word,
          categoryId,
          suggestedBy: user.id,
        })

        if (result.alreadyExists) {
          socket.emit('word:suggested', {
            success: false,
            error: 'La palabra ya existe',
          })
          return
        }

        if (!result.success) {
          socket.emit('word:suggested', {
            success: false,
            error: 'Error al sugerir la palabra',
          })
          return
        }

        socket.emit('word:suggested', { success: true })

        // Send notification email
        if (emailService) {
          const categories = await getRandomWordUseCase.getCategories()
          const category = categories.categories.find((c) => c.id === categoryId)
          await emailService.sendNewSuggestionNotification(
            word,
            category?.name ?? 'Unknown',
            user.displayName
          )
        }
      } catch (error) {
        console.error('Error suggesting word:', error)
        socket.emit('word:suggested', {
          success: false,
          error: 'Error al sugerir la palabra',
        })
      }
    })
  }
}
