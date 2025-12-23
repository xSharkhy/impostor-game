import { SupabaseClient } from '@supabase/supabase-js'
import { IAuthService, AuthUser } from '../../application/ports/services/IAuthService.js'
import { env } from '../../config/env.js'

export class SupabaseAuthService implements IAuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  private async getDisplayName(userId: string, fallbackName: string): Promise<string> {
    const { data } = await this.supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    return data?.display_name || fallbackName
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    const fallbackName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Anonymous'

    const displayName = await this.getDisplayName(user.id, fallbackName)

    return {
      id: user.id,
      email: user.email ?? undefined,
      displayName,
    }
  }

  isAdmin(email: string): boolean {
    return env.adminEmails.includes(email)
  }
}
