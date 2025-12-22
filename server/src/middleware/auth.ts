import { createClient } from '@supabase/supabase-js'
import type { Socket } from 'socket.io'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseSecretKey)

export interface AuthenticatedSocket extends Socket {
  user: {
    id: string
    displayName: string
    email?: string
  }
}

export async function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth.token as string | undefined

  if (!token) {
    return next(new Error('Authentication required'))
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return next(new Error('Invalid token'))
    }

    ;(socket as AuthenticatedSocket).user = {
      id: data.user.id,
      displayName:
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'Jugador',
      email: data.user.email,
    }

    next()
  } catch {
    next(new Error('Authentication failed'))
  }
}

// Verify token for REST API requests
export async function verifyToken(token: string): Promise<{
  id: string
  displayName: string
  email?: string
} | null> {
  try {
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return null
    }

    return {
      id: data.user.id,
      displayName:
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'Jugador',
      email: data.user.email,
    }
  } catch {
    return null
  }
}
