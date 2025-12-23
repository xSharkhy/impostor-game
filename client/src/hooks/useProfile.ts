import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores'
import { getSocketInstance } from './useSocket'

interface Profile {
  id: string
  display_name: string
  updated_at: string
}

export function useProfile() {
  const { user, setUser } = useUserStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    if (error) {
      // Profile might not exist yet (for users created before the trigger)
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching profile:', error)
      return null
    }

    return (data as Profile)?.display_name ?? null
  }, [])

  const updateDisplayName = useCallback(
    async (newName: string): Promise<boolean> => {
      if (!user) return false

      const trimmedName = newName.trim()
      if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 20) {
        setError('El nombre debe tener entre 2 y 20 caracteres')
        return false
      }

      setIsUpdating(true)
      setError(null)

      try {
        // Upsert profile (insert if not exists, update if exists)
        const { error: upsertError } = await supabase.from('profiles').upsert(
          {
            id: user.id,
            display_name: trimmedName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

        if (upsertError) {
          console.error('Error updating profile:', upsertError)
          setError('Error al guardar el nombre')
          return false
        }

        // Update local state
        setUser({
          ...user,
          displayName: trimmedName,
        })

        // Notify server to update socket user and room if in one
        const socket = getSocketInstance()
        if (socket?.connected) {
          socket.emit('user:updateDisplayName', { displayName: trimmedName })
        }

        return true
      } catch (err) {
        console.error('Error updating display name:', err)
        setError('Error al guardar el nombre')
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [user, setUser]
  )

  const createProfileIfNotExists = useCallback(
    async (userId: string, defaultName: string): Promise<void> => {
      const existingName = await fetchProfile(userId)
      if (existingName) return

      // Create profile with default name
      await supabase.from('profiles').insert({
        id: userId,
        display_name: defaultName,
      })
    },
    [fetchProfile]
  )

  return {
    fetchProfile,
    updateDisplayName,
    createProfileIfNotExists,
    isUpdating,
    error,
    clearError: () => setError(null),
  }
}
