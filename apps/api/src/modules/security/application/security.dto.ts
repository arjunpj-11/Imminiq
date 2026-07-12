import type { AuthProvider } from '../domain/security.types'

export interface ISensitiveActionStepUpPayloadDTO {
  currentPassword?: string
  twoFactorCode?: string
}

export interface IChangeEmailPayloadDTO extends ISensitiveActionStepUpPayloadDTO {
  newEmail: string
}

export interface IVerifyEmailChangePayloadDTO {
  token: string
}

export interface IChangePasswordPayloadDTO {
  currentPassword: string
  newPassword: string
}

export interface IDeleteAccountPayloadDTO extends ISensitiveActionStepUpPayloadDTO {
  confirmation: 'DELETE'
}

export interface IVerifyTwoFactorSetupPayloadDTO {
  token: string
}

export interface IDisableTwoFactorPayloadDTO {
  token: string
}

export interface ISecuritySessionDTO {
  id: string
  deviceName: string
  location: string
  client: string
  lastActive: string
  current: boolean
}

export interface ISecurityOverviewDTO {
  email: string
  emailVerified: boolean
  pendingEmail: string | null
  authProvider: AuthProvider
  canChangePassword: boolean
  twoFactorEnabled: boolean
  activeSessions: ISecuritySessionDTO[]
  passwordLastChangedAt: string | null
}

export interface ITwoFactorSetupResponseDTO {
  qrCodeDataUrl: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
}

export interface ITwoFactorVerifyResponseDTO {
  enabled: boolean
  backupCodes: string[]
}

export interface IEmailChangeRequestResponseDTO {
  pendingEmail: string
  verificationSent: boolean
  expiresInMinutes: number
}

export interface IVerifyEmailChangeResponseDTO {
  email: string
  emailVerified: boolean
  verified: true
  sessionsRevoked: true
}

export interface IChangePasswordResponseDTO {
  sessionsRevoked: true
}

export interface IRevokeSessionResponseDTO {
  revoked: true
  sessionId: string
}

export interface IDisableTwoFactorResponseDTO {
  disabled: true
}

export interface IDeleteAccountResponseDTO {
  deleted: true
  deletionScheduled: true
  scheduledDeletionAt: string
  recoveryWindowDays: number
}
