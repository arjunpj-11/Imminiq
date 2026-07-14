import type { PlatformPolicy } from '../../../../../shared/platform-policy';

export type AdminSettingsInput = {
  allowBroadcasts: boolean;
  supportEmail: string;
  auditRetentionDays: number;
  productPolicy: PlatformPolicy;
};
export type AdminSettings = AdminSettingsInput & { updatedAt: Date };
