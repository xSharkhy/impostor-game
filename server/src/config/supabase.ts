import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from './env.js'

let supabaseClient: SupabaseClient | null = null

/**
 * Get the Supabase client singleton
 * Uses service key if available (bypasses RLS for server operations)
 * Falls back to anon key for client-like operations
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Prefer service key for server-side operations (bypasses RLS)
    const key = env.supabaseServiceKey || env.supabaseAnonKey

    supabaseClient = createClient(env.supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
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
    throw new Error('SUPABASE_SECRET_KEY is required for admin operations')
  }

  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
