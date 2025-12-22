import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from './env.js'

let supabaseClient: SupabaseClient | null = null

/**
 * Get the Supabase client singleton
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    })
  }
  return supabaseClient
}

/**
 * Get a Supabase client with service role (for admin operations)
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!env.supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is required for admin operations')
  }

  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
