import type { SecuritySessionEntity } from '../entities/security-session.entity'

export type RevokeSecuritySessionInput = {
  userId: string
  sessionId: string
}

export interface SecuritySessionRepositoryContract {
  findActiveSessions(userId: string): Promise<SecuritySessionEntity[]>

  findCurrentSessionByRefreshTokenHash(
    refreshTokenHash: string
  ): Promise<SecuritySessionEntity | null>

  revokeSessionById(
    input: RevokeSecuritySessionInput
  ): Promise<SecuritySessionEntity | null>

  revokeAllSessions(userId: string): Promise<void>
}