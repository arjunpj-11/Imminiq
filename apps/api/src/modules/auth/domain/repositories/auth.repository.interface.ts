import type {
  AuthSessionRecord,
  AuthUserRecord,
  OtpPurpose,
  TwoFactorAuthRecord,
} from '../types/auth.types'

export interface AuthRepositoryContract {
  findByEmail(email: string): Promise<AuthUserRecord | null>
  findByPhone(phone: string): Promise<AuthUserRecord | null>
  findByIdentifier(identifier: string): Promise<AuthUserRecord | null>
  findById(id: string): Promise<AuthUserRecord | null>
  findByUsername(username: string): Promise<AuthUserRecord | null>

  emailExists(email: string): Promise<boolean>
  phoneExists(phone: string): Promise<boolean>
  usernameExists(username: string): Promise<boolean>

  createUser(data: {
    fullName: string
    email?: string
    phone?: string
    username: string
    passwordHash: string
  }): Promise<AuthUserRecord>

  createOAuthUser(data: {
    fullName: string
    email: string
    username: string
    avatarUrl?: string
    provider: 'google' | 'github'
    providerId: string
  }): Promise<AuthUserRecord>

  updateProfile(
    id: string,
    data: {
      fullName?: string
      username?: string
      avatarUrl?: string
    }
  ): Promise<AuthUserRecord | null>

  updateUser(id: string, data: Record<string, unknown>): Promise<AuthUserRecord | null>

  markEmailVerified(id: string): Promise<AuthUserRecord | null>
  markPhoneVerified(id: string): Promise<AuthUserRecord | null>
  updatePassword(id: string, newPassword: string): Promise<AuthUserRecord | null>
  updateLastActive(id: string): Promise<AuthUserRecord | null>
  cancelScheduledDeletionIfRecoverable(id: string): Promise<AuthUserRecord | null>
  deleteUserById(id: string): Promise<AuthUserRecord | null>

  hasActiveTwoFactor(userId: string): Promise<boolean>
  findActiveTwoFactorForLogin(userId: string): Promise<TwoFactorAuthRecord | null>
  touchTwoFactorLastUsed(userId: string): Promise<TwoFactorAuthRecord | null>
  markBackupCodeUsed(
    userId: string,
    backupCodeIndex: number
  ): Promise<TwoFactorAuthRecord | null>

  saveRefreshToken(data: {
    userId: string
    refreshToken: string
    device?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<AuthSessionRecord>

  findRefreshToken(refreshToken: string): Promise<AuthSessionRecord | null>
  rotateRefreshTokenInSameSession(
    sessionId: string,
    newRefreshToken: string,
    meta?: {
      device?: string
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<AuthSessionRecord | null>
  findAllUserTokens(userId: string): Promise<AuthSessionRecord[]>
  revokeRefreshToken(refreshToken: string): Promise<boolean>
  revokeAllUserTokens(userId: string): Promise<unknown>
  revokeSessionById(sessionId: string, userId: string): Promise<AuthSessionRecord | null>

  saveOtp(data: {
    email?: string
    phone?: string
    otp: string
    purpose: OtpPurpose
  }): Promise<boolean>

  verifyOtp(data: {
    email?: string
    phone?: string
    otp: string
    purpose: OtpPurpose
  }): Promise<boolean>
}
