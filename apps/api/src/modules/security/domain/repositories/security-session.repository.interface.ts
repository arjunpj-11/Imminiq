import type { SecuritySessionEntity } from '../entities/security-session.entity'

export interface SecuritySessionRepositoryContract {
  findActiveSessions(userId: string): Promise<SecuritySessionEntity[]>
  findCurrentRefreshTokenSession(
    refreshToken: string,
  ): Promise<SecuritySessionEntity | null>
  revokeSessionById(
    userId: string,
    sessionId: string,
  ): Promise<SecuritySessionEntity | null>
  revokeAllSessions(userId: string): Promise<void>
}
