import type {
  PendingEmailUserRecord,
  SecurityUserRecord,
  SessionRecord,
  TwoFactorRecord,
} from '../types/security.types'

export interface SecurityRepository {
  findUserById(userId: string): Promise<SecurityUserRecord | null>
  emailExists(email: string): Promise<boolean>

  savePendingEmailChange(
    userId: string,
    data: {
      pendingEmail: string
      tokenHash: string
      expiresAt: Date
    }
  ): Promise<SecurityUserRecord | null>

  findUserByPendingEmailTokenHash(
    tokenHash: string
  ): Promise<PendingEmailUserRecord | null>

  confirmPendingEmailChange(
    userId: string,
    pendingEmail: string
  ): Promise<SecurityUserRecord | null>

  clearPendingEmailChange(
    userId: string
  ): Promise<SecurityUserRecord | null>

  findTwoFactorByUserId(
    userId: string
  ): Promise<TwoFactorRecord | null>

  findTwoFactorWithSecret(
    userId: string
  ): Promise<TwoFactorRecord | null>

  savePendingTwoFactorSetup(
    userId: string,
    data: {
      encryptedSecret: string
      issuer: string
      accountLabel: string
      qrCodeUri: string
    }
  ): Promise<TwoFactorRecord | null>

  activateTwoFactor(
    userId: string,
    backupCodes: Array<{
      codeHash: string
      usedAt: null
    }>
  ): Promise<TwoFactorRecord | null>

  disableTwoFactor(
    userId: string
  ): Promise<TwoFactorRecord | null>

  findActiveSessions(
    userId: string
  ): Promise<SessionRecord[]>

  findCurrentRefreshTokenRecord(
    refreshToken: string
  ): Promise<SessionRecord | null>

  revokeSessionById(
    userId: string,
    sessionId: string
  ): Promise<unknown>

  revokeAllSessions(
    userId: string
  ): Promise<unknown>

  scheduleAccountDeletion(
    userId: string,
    scheduledDeletionAt: Date
  ): Promise<SecurityUserRecord | null>
}