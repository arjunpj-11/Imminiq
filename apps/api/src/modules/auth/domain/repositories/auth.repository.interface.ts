import type { OtpPurpose } from '../types/auth.types'

/**
 * Domain-facing repository contract.
 * The current Mongo implementation is exposed through
 * `infrastructure/repositories/mongo-auth.repository.ts`.
 *
 * This contract is intentionally focused on the capabilities the Auth
 * application layer needs, rather than Mongoose implementation details.
 */
export interface AuthRepositoryContract {
  findByEmail(email: string): Promise<unknown>
  findByPhone(phone: string): Promise<unknown>
  findByIdentifier(identifier: string): Promise<unknown>
  findById(id: string): Promise<unknown>
  findByUsername(username: string): Promise<unknown>

  emailExists(email: string): Promise<boolean>
  phoneExists(phone: string): Promise<boolean>
  usernameExists(username: string): Promise<boolean>

  createUser(data: {
    fullName: string
    email?: string
    phone?: string
    username: string
    passwordHash: string
  }): Promise<unknown>

  createOAuthUser(data: {
    fullName: string
    email: string
    username: string
    avatarUrl?: string
    provider: 'google' | 'github'
    providerId: string
  }): Promise<unknown>

  markEmailVerified(id: string): Promise<unknown>
  markPhoneVerified(id: string): Promise<unknown>
  updatePassword(id: string, newPassword: string): Promise<unknown>
  updateLastActive(id: string): Promise<unknown>

  hasActiveTwoFactor(userId: string): Promise<boolean>
  findActiveTwoFactorForLogin(userId: string): Promise<unknown>
  touchTwoFactorLastUsed(userId: string): Promise<unknown>
  markBackupCodeUsed(
    userId: string,
    backupCodeIndex: number
  ): Promise<unknown>

  saveRefreshToken(data: {
    userId: string
    refreshToken: string
    device?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<unknown>

  findRefreshToken(refreshToken: string): Promise<unknown>
  rotateRefreshTokenInSameSession(
    sessionId: string,
    newRefreshToken: string,
    meta?: {
      device?: string
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<unknown>
  findAllUserTokens(userId: string): Promise<unknown>
  revokeRefreshToken(refreshToken: string): Promise<boolean>
  revokeAllUserTokens(userId: string): Promise<unknown>
  revokeSessionById(sessionId: string, userId: string): Promise<unknown>

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
