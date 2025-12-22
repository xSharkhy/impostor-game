import { SupabaseClient } from '@supabase/supabase-js'
import { IAuthService, AuthUser } from '../../application/ports/services/IAuthService.js'
import { env } from '../../config/env.js'

export class SupabaseAuthService implements IAuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async verifyToken(token: string): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email ?? undefined,
      displayName: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Anonymous',
    }
  }

  isAdmin(email: string): boolean {
    return env.adminEmails.includes(email)
  }
}
