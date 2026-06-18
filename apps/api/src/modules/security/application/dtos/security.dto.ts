import type { AuthProvider } from '../../domain/value-objects/auth-provider.vo'
import type { TwoFactorStatus } from '../../domain/value-objects/two-factor-status.vo'

export interface SensitiveActionStepUpPayload {
  currentPassword?: string
  twoFactorCode?: string
}

export interface ChangeEmailPayload extends SensitiveActionStepUpPayload {
  newEmail: string
}

export interface VerifyEmailChangePayload {
  token: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface DeleteAccountPayload extends SensitiveActionStepUpPayload {
  confirmation: 'DELETE'
}

export interface VerifyTwoFactorSetupPayload {
  token: string
}

export interface DisableTwoFactorPayload {
  token: string
}

export interface SecuritySessionDto {
  id: string
  deviceName: string
  location: string
  client: string
  lastActive: string
  current: boolean
}

export interface SecurityOverviewDto {
  email: string
  emailVerified: boolean
  pendingEmail: string | null
  authProvider: AuthProvider
  canChangePassword: boolean
  twoFactorEnabled: boolean
  activeSessions: SecuritySessionDto[]
  passwordLastChangedAt: string | null
}

export interface TwoFactorSetupResponseDto {
  qrCodeDataUrl: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
}

export interface TwoFactorVerifyResponseDto {
  enabled: boolean
  backupCodes: string[]
}

export interface TwoFactorStatusResponseDto {
  enabled: boolean
  status: TwoFactorStatus
}

export interface EmailChangeRequestResponseDto {
  pendingEmail: string
  verificationSent: boolean
  expiresInMinutes: number
}

export interface VerifyEmailChangeResponseDto {
  email: string
  emailVerified: boolean
  verified: true
  sessionsRevoked: true
}

export interface ChangePasswordResponseDto {
  sessionsRevoked: true
}

export interface SessionsResponseDto {
  activeSessions: SecuritySessionDto[]
}

export interface RevokeSessionResponseDto {
  revoked: true
  sessionId: string
}

export interface DisableTwoFactorResponseDto {
  disabled: true
}

export interface DeleteAccountResponseDto {
  deleted: true
  deletionScheduled: true
  scheduledDeletionAt: string
  recoveryWindowDays: number
}
