import type { AuthSessionEntity } from '../entities/auth-session.entity'

export interface AuthSessionRepositoryContract {
  saveRefreshToken(data: {
    userId: string
    refreshToken: string
    device?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<AuthSessionEntity>

  findRefreshToken(refreshToken: string): Promise<AuthSessionEntity | null>
  rotateRefreshTokenInSameSession(
    sessionId: string,
    newRefreshToken: string,
    meta?: {
      device?: string
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<AuthSessionEntity | null>
  findAllUserTokens(userId: string): Promise<AuthSessionEntity[]>
  revokeRefreshToken(refreshToken: string): Promise<boolean>
  revokeAllUserTokens(userId: string): Promise<void>
  revokeSessionById(sessionId: string, userId: string): Promise<AuthSessionEntity | null>
}
