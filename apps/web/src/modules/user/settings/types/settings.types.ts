export type ThemeType = 'light' | 'dark' | 'system';
export interface IAppearanceSettings {
  theme: ThemeType;
}
export interface INotificationTypeSettings {
  adminBroadcasts: boolean;
}
export interface INotificationSettings {
  globalEnabled: boolean;
  types: INotificationTypeSettings;
}
export interface IPrivacySettings {
  showProfile: boolean;
  showActivity: boolean;
  showStats: boolean;
}

export interface IUserSettings {
  _id: string;
  userId: string;

  appearance: IAppearanceSettings;
  notifications: INotificationSettings;
  privacy: IPrivacySettings;
  createdAt: string;
  updatedAt: string;
}

export interface IApiEnvelope<T> {
  success?: boolean;
  message: string;
  data: T;
}

export interface IUpdateAppearancePayload {
  theme?: ThemeType;
}

export interface IUpdateNotificationsPayload {
  globalEnabled?: boolean;
  types?: Partial<INotificationTypeSettings>;
}

export interface IUpdatePrivacyPayload {
  showProfile?: boolean;
  showActivity?: boolean;
  showStats?: boolean;
}

/* ─── Account Security ─── */

export interface ISecuritySession {
  id: string;
  deviceName: string;
  location: string;
  client: string;
  lastActive: string;
  current?: boolean;
}

export interface ISecurityOverview {
  email: string;
  emailVerified: boolean;
  pendingEmail: string | null;

  authProvider: 'local' | 'google' | 'github';
  canChangePassword: boolean;

  twoFactorEnabled: boolean;
  activeSessions: ISecuritySession[];
  passwordLastChangedAt: string | null;
}

export interface ISensitiveActionStepUpPayload {
  currentPassword?: string;
  twoFactorCode?: string;
}

export interface IChangeEmailPayload extends ISensitiveActionStepUpPayload {
  newEmail: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IDeleteAccountPayload extends ISensitiveActionStepUpPayload {
  confirmation: 'DELETE';
}

export interface IDeleteAccountResponse {
  deleted: true;
  deletionScheduled: true;
  scheduledDeletionAt: string;
  recoveryWindowDays: number;
}

export interface ITwoFactorSetupResponse {
  qrCodeDataUrl: string;
  manualEntryKey: string;
  issuer: string;
  accountLabel: string;
}

export interface IVerifyTwoFactorSetupPayload {
  token: string;
}

export interface IVerifyTwoFactorSetupResponse {
  enabled: boolean;
  backupCodes: string[];
}

export interface IDisableTwoFactorPayload {
  token: string;
}

export interface IDisableTwoFactorResponse {
  disabled: boolean;
}
export type DataPrivacyRequest = {
  id: string;
  type: 'access' | 'export' | 'delete' | 'correction';
  details: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  resolutionNote?: string;
  downloadUrl?: string;
  dueAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
