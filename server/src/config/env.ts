import 'dotenv/config'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue
}

export const env = {
  // Server
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  clientUrl: optionalEnv('CLIENT_URL', 'http://localhost:5173'),
  appUrl: optionalEnv('APP_URL', 'http://localhost:5173'),

  // Supabase
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_PUBLISHABLE_KEY'),
  supabaseServiceKey: optionalEnv('SUPABASE_SECRET_KEY', ''),

  // Email (Resend)
  resendApiKey: optionalEnv('RESEND_API_KEY', ''),

  // Admin (supports both ADMIN_EMAIL and ADMIN_EMAILS)
  adminEmails: (optionalEnv('ADMIN_EMAILS', '') || optionalEnv('ADMIN_EMAIL', '')).split(',').filter(Boolean),

  // Feature flags
  enableRealtime: optionalEnv('ENABLE_REALTIME', 'false') === 'true',
} as const

export type Env = typeof env
