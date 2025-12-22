export interface AuthUser {
  id: string
  displayName: string
  email?: string
}

export interface IAuthService {
  /**
   * Verify a JWT token and return user info
   */
  verifyToken(token: string): Promise<AuthUser | null>

  /**
   * Check if user email is an admin
   */
  isAdmin(email: string): boolean
}
