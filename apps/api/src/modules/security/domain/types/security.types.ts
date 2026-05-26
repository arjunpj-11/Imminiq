export type SensitiveActionStepUpPayload = {
  currentPassword?: string
  twoFactorCode?: string
}

export type ChangeEmailPayload = SensitiveActionStepUpPayload & {
  newEmail: string
}

export type VerifyEmailChangePayload = {
  token: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type DeleteAccountPayload = SensitiveActionStepUpPayload & {
  confirmation: 'DELETE'
}

export type SecuritySession = {
  id: string
  deviceName: string
  location: string
  client: string
  lastActive: string
  current: boolean
}

export type SecurityOverview = {
  email: string
  emailVerified: boolean
  pendingEmail: string | null

  authProvider: 'local' | 'google' | 'github'
  canChangePassword: boolean

  twoFactorEnabled: boolean
  activeSessions: SecuritySession[]
  passwordLastChangedAt: string | null
}

export type VerifyTwoFactorSetupPayload = {
  token: string
}

export type DisableTwoFactorPayload = {
  token: string
}

export type TwoFactorSetupResponse = {
  qrCodeDataUrl: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
}

export type TwoFactorVerifyResponse = {
  enabled: boolean
  backupCodes: string[]
}

export type TwoFactorStatusResponse = {
  enabled: boolean
  status: 'not_configured' | 'pending' | 'active' | 'disabled'
}

export type EmailChangeRequestResponse = {
  pendingEmail: string
  verificationSent: boolean
  expiresInMinutes: number
}

export type VerifyEmailChangeResponse = {
  email: string
  emailVerified: boolean
  verified: true
  sessionsRevoked: true
}

export type ChangePasswordResponse = {
  sessionsRevoked: true
}

export type SessionsResponse = {
  activeSessions: SecuritySession[]
}

export type RevokeSessionResponse = {
  revoked: true
  sessionId: string
}

export type DisableTwoFactorResponse = {
  disabled: true
}

export type DeleteAccountResponse = {
  deleted: true
  deletionScheduled: true
  scheduledDeletionAt: string
  recoveryWindowDays: 30
}

export type IdLike = string | { toString(): string }

export interface SecurityUserRecord {
  _id: IdLike
  email?: string | null
  emailVerified: boolean
  pendingEmail?: string | null
  provider: 'local' | 'google' | 'github'
  fullName: string
  username: string
  passwordHash?: string | null
}

export interface PendingEmailUserRecord extends SecurityUserRecord {
  pendingEmail: string
}

export interface TwoFactorRecord {
  status: 'pending' | 'active' | 'disabled' | string
  totpSecretEncrypted?: string
  _id?: IdLike
}

export interface SessionRecord {
  _id: IdLike
  device?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  updatedAt?: Date | null
}
