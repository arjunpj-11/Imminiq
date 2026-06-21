import type { AuthSessionEntity } from '../entities/auth-session.entity'

export type AuthSessionMetaInput = {
  device?: string
  ipAddress?: string
  userAgent?: string
}

export type SaveAuthSessionInput = AuthSessionMetaInput & {
  userId: string
  refreshTokenHash: string
}

export type RotateAuthSessionInput = {
  sessionId: string
  newRefreshTokenHash: string
  meta?: AuthSessionMetaInput
}

export interface AuthSessionRepositoryContract {
  saveSession(data: SaveAuthSessionInput): Promise<AuthSessionEntity>

  findSessionByRefreshTokenHash(
    refreshTokenHash: string
  ): Promise<AuthSessionEntity | null>

  rotateRefreshTokenInSameSession(
    data: RotateAuthSessionInput
  ): Promise<AuthSessionEntity | null>

  findAllUserSessions(userId: string): Promise<AuthSessionEntity[]>

  revokeSessionByRefreshTokenHash(refreshTokenHash: string): Promise<boolean>

  revokeAllUserSessions(userId: string): Promise<void>

  revokeSessionById(
    sessionId: string,
    userId: string
  ): Promise<AuthSessionEntity | null>
}