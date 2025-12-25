module.exports = {
  apps: [{
    name: 'impostor-webhook',
    script: 'webhook-server.js',
    cwd: '/home/sharkhy/impostor-game/scripts',
    env: {
      NODE_ENV: 'production',
      WEBHOOK_PORT: 9000,
      WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || '',
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '100M',
  }]
}
