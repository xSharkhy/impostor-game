import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@impostor/shared'
import { supabase } from '../supabase/client.js'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let socketInstance: TypedSocket | null = null
let isInitializing = false

/**
 * Get or create a singleton socket connection
 * Handles authentication automatically via Supabase session
 */
export async function getOrCreateSocket(): Promise<TypedSocket | null> {
  if (socketInstance?.connected) return socketInstance
  if (isInitializing) return null

  isInitializing = true

  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      isInitializing = false
      return null
    }

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    isInitializing = false
    return socketInstance
  } catch (error) {
    isInitializing = false
    console.error('Failed to create socket connection:', error)
    return null
  }
}

/**
 * Get current socket instance (may be null if not connected)
 */
export function getSocket(): TypedSocket | null {
  return socketInstance
}

/**
 * Disconnect and cleanup socket
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
