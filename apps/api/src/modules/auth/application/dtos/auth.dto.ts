import type { AuthRole } from '../../domain/value-objects/auth-role.vo'
import type { UserStatus } from '../../domain/value-objects/user-status.vo'
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo'
import type { LoginRedirectPath } from '../../domain/value-objects/login-redirect-path.vo'

export interface RegisterPayload {
  fullName: string
  identifier: string
  password: string
}

export interface LoginPayload {
  identifier: string
  password: string
}

export interface TwoFactorLoginVerifyPayload {
  code: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  _id: string
  fullName: string
  username: string
  email?: string
  phone?: string
  role: AuthRole
  status: UserStatus
  emailVerified: boolean
  phoneVerified: boolean
  isPremium: boolean
  avatarUrl?: string | null
  onboardingCompleted: boolean
}

export interface AuthSessionDto {
  id: string
  expiresAt: string
  revokedAt: string | null
  device?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string | null
}

export interface AuthLoginSuccessResult {
  requiresTwoFactor: false
  tokens: TokenPair
  user: AuthUser
  redirectPath: LoginRedirectPath
}

export interface AuthTwoFactorChallengeResult {
  requiresTwoFactor: true
  challengeToken: string
  challengeExpiresInMinutes: number
}

export type AuthLoginResult =
  | AuthLoginSuccessResult
  | AuthTwoFactorChallengeResult

export interface AuthResponse {
  success: boolean
  message: string
  data:
    | {
        accessToken: string
        user: AuthUser
        redirectPath: LoginRedirectPath
      }
    | {
        requiresTwoFactor: true
        challengeExpiresInMinutes: number
      }
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    user: AuthUser
    verificationTarget: string
    verificationMethod: VerificationMethod
  }
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export type RequestMeta = {
  device?: string
  ipAddress?: string
  userAgent?: string
}

export type OAuthLoginUser = {
  id?: string
  _id?: string | { toString(): string }
  fullName: string
  username: string
  email?: string
  phone?: string
  role: AuthRole
  status: UserStatus
  emailVerified: boolean
  phoneVerified: boolean
  isPremium: boolean
  avatarUrl?: string | null
  onboardingCompleted: boolean
}
