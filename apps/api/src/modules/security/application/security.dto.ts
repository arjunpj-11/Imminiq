import type { AuthProvider } from '../domain/security.types';

export interface SensitiveActionStepUpPayloadDTO {
  currentPassword?: string;
  twoFactorCode?: string;
}

export interface ChangeEmailPayloadDTO extends SensitiveActionStepUpPayloadDTO {
  newEmail: string;
}

export interface VerifyEmailChangePayloadDTO {
  token: string;
}

export interface ChangePasswordPayloadDTO {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountPayloadDTO extends SensitiveActionStepUpPayloadDTO {
  confirmation: 'DELETE';
}

export interface VerifyTwoFactorSetupPayloadDTO {
  token: string;
}

export interface DisableTwoFactorPayloadDTO {
  token: string;
}

export interface SecuritySessionDTO {
  id: string;
  deviceName: string;
  location: string;
  client: string;
  lastActive: string;
  current: boolean;
}

export interface SecurityOverviewDTO {
  email: string;
  emailVerified: boolean;
  pendingEmail: string | null;
  authProvider: AuthProvider;
  canChangePassword: boolean;
  twoFactorEnabled: boolean;
  activeSessions: SecuritySessionDTO[];
  passwordLastChangedAt: string | null;
}

export interface TwoFactorSetupResponseDTO {
  qrCodeDataUrl: string;
  manualEntryKey: string;
  issuer: string;
  accountLabel: string;
}

export interface TwoFactorVerifyResponseDTO {
  enabled: boolean;
  backupCodes: string[];
}

export interface EmailChangeRequestResponseDTO {
  pendingEmail: string;
  verificationSent: boolean;
  expiresInMinutes: number;
}

export interface VerifyEmailChangeResponseDTO {
  email: string;
  emailVerified: boolean;
  verified: true;
  sessionsRevoked: true;
}

export interface ChangePasswordResponseDTO {
  sessionsRevoked: true;
}

export interface RevokeSessionResponseDTO {
  revoked: true;
  sessionId: string;
}

export interface DisableTwoFactorResponseDTO {
  disabled: true;
}

export interface DeleteAccountResponseDTO {
  deleted: true;
  deletionScheduled: true;
  scheduledDeletionAt: string;
  recoveryWindowDays: number;
}
