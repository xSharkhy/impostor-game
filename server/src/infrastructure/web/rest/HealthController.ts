import type { Router } from 'express'
import { Router as createRouter } from 'express'

export function createHealthController(): Router {
  const router = createRouter()

  router.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })

  return router
}
