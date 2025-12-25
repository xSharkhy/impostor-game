/**
 * GitHub Webhook Server for Auto-Deploy
 *
 * Listens for GitHub push events and triggers deployment
 * for main (production) and beta branches.
 *
 * Usage: node webhook-server.js
 *
 * Environment variables:
 *   WEBHOOK_SECRET - GitHub webhook secret for verification
 *   WEBHOOK_PORT - Port to listen on (default: 9000)
 */

import { createServer } from 'http'
import { createHmac } from 'crypto'
import { execSync, spawn } from 'child_process'

const PORT = process.env.WEBHOOK_PORT || 9000
const SECRET = process.env.WEBHOOK_SECRET || ''

// Deployment configurations
const DEPLOYMENTS = {
  main: {
    path: '/home/sharkhy/impostor-game',
    pm2Name: 'impostor-api',
  },
  beta: {
    path: '/home/sharkhy/impostor-beta',
    pm2Name: 'impostor-api-beta',
  },
}

function verifySignature(payload, signature) {
  if (!SECRET) {
    console.log('⚠️  No WEBHOOK_SECRET set, skipping verification')
    return true
  }

  const hmac = createHmac('sha256', SECRET)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return signature === digest
}

function deploy(branch) {
  const config = DEPLOYMENTS[branch]
  if (!config) {
    console.log(`❌ Unknown branch: ${branch}`)
    return
  }

  console.log(`🚀 Deploying ${branch}...`)

  const script = `
    cd ${config.path}
    echo "📥 Pulling latest changes..."
    git pull origin ${branch}
    echo "📦 Installing dependencies..."
    pnpm install
    echo "🔨 Building server..."
    pnpm build:server
    echo "🔄 Restarting PM2..."
    pm2 restart ${config.pm2Name} --update-env
    echo "✅ Deploy complete: $(date)"
  `

  // Run deploy in background
  const child = spawn('bash', ['-c', script], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (data) => console.log(`[${branch}] ${data.toString().trim()}`))
  child.stderr.on('data', (data) => console.error(`[${branch}] ${data.toString().trim()}`))

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ ${branch} deployed successfully`)
    } else {
      console.error(`❌ ${branch} deploy failed with code ${code}`)
    }
  })
}

const server = createServer((req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
    return
  }

  // Only accept POST to /webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  let body = ''
  req.on('data', (chunk) => { body += chunk })

  req.on('end', () => {
    // Verify signature
    const signature = req.headers['x-hub-signature-256']
    if (SECRET && !verifySignature(body, signature)) {
      console.log('❌ Invalid signature')
      res.writeHead(401)
      res.end('Invalid signature')
      return
    }

    try {
      const payload = JSON.parse(body)
      const event = req.headers['x-github-event']

      console.log(`📬 Received ${event} event`)

      // Only handle push events
      if (event !== 'push') {
        res.writeHead(200)
        res.end('Ignored (not a push event)')
        return
      }

      // Extract branch name from ref (refs/heads/main -> main)
      const branch = payload.ref?.replace('refs/heads/', '')

      if (!branch || !DEPLOYMENTS[branch]) {
        console.log(`⏭️  Ignoring push to ${branch}`)
        res.writeHead(200)
        res.end(`Ignored (branch ${branch} not configured)`)
        return
      }

      console.log(`📦 Push to ${branch} by ${payload.pusher?.name || 'unknown'}`)
      console.log(`   Commits: ${payload.commits?.length || 0}`)

      // Trigger deploy
      deploy(branch)

      res.writeHead(200)
      res.end(`Deploying ${branch}...`)

    } catch (err) {
      console.error('❌ Error parsing webhook:', err.message)
      res.writeHead(400)
      res.end('Invalid payload')
    }
  })
})

server.listen(PORT, () => {
  console.log(`🎣 Webhook server listening on port ${PORT}`)
  console.log(`   Configured branches: ${Object.keys(DEPLOYMENTS).join(', ')}`)
  console.log(`   Secret: ${SECRET ? 'configured' : 'NOT SET (verification disabled)'}`)
})
