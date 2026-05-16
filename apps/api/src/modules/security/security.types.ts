// apps/api/src/modules/security/security.types.ts

export type ChangeEmailPayload = {
  newEmail: string
}

export type VerifyEmailChangePayload = {
  token: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type DeleteAccountPayload = {
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