import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Get default display name from OAuth metadata
function getDefaultDisplayName(user: SupabaseUser): string {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Jugador'
  )
}

// Fetch custom display name from profiles table
async function fetchProfileDisplayName(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data.display_name
}

// Create profile if it doesn't exist (for users created before the trigger)
async function ensureProfileExists(userId: string, defaultName: string): Promise<void> {
  await supabase.from('profiles').upsert(
    { id: userId, display_name: defaultName },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}

export function useAuth() {
  const { setUser, setLoading, logout } = useUserStore()

  const handleUser = useCallback(
    async (user: SupabaseUser | undefined | null) => {
      if (!user) {
        setUser(null)
        return
      }

      const defaultName = getDefaultDisplayName(user)

      // Try to get custom display name from profiles
      const profileName = await fetchProfileDisplayName(user.id)

      if (!profileName) {
        // Ensure profile exists for new users
        await ensureProfileExists(user.id, defaultName)
      }

      setUser({
        id: user.id,
        displayName: profileName || defaultName,
        email: user.email,
      })
    },
    [setUser]
  )

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUser(session?.user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUser(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [handleUser, setLoading])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) throw error
  }

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    logout()
  }

  return {
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  }
}
