import type { Router, Request, Response, NextFunction } from 'express'
import { Router as createRouter } from 'express'
import type { Container } from '../../../config/container.js'
import type { IAuthService } from '../../../application/ports/services/IAuthService.js'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    displayName: string
    email?: string
  }
}

function createAdminMiddleware(authService: IAuthService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.slice(7)
    const user = await authService.verifyToken(token)

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (!user.email || !authService.isAdmin(user.email)) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    ;(req as AuthenticatedRequest).user = user
    next()
  }
}

export function createAdminController(container: Container): Router {
  const router = createRouter()
  const { approveWordUseCase, authService } = container

  const adminMiddleware = createAdminMiddleware(authService)

  // Get pending word suggestions
  router.get('/suggestions', adminMiddleware, async (_req, res) => {
    try {
      const result = await approveWordUseCase.getPendingSuggestions()
      res.json(result.suggestions)
    } catch (error) {
      console.error('Error getting suggestions:', error)
      res.status(500).json({ error: 'Failed to get suggestions' })
    }
  })

  // Approve word
  router.post('/words/:id/approve', adminMiddleware, async (req, res) => {
    try {
      const result = await approveWordUseCase.execute({
        wordId: req.params.id,
        approve: true,
      })

      if (result.success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to approve word' })
      }
    } catch (error) {
      console.error('Error approving word:', error)
      res.status(500).json({ error: 'Failed to approve word' })
    }
  })

  // Reject word
  router.delete('/words/:id', adminMiddleware, async (req, res) => {
    try {
      const result = await approveWordUseCase.execute({
        wordId: req.params.id,
        approve: false,
      })

      if (result.success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to reject word' })
      }
    } catch (error) {
      console.error('Error rejecting word:', error)
      res.status(500).json({ error: 'Failed to reject word' })
    }
  })

  return router
}
