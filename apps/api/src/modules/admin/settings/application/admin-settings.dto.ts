import type { PlatformPolicy } from '../../../../shared/platform-policy';

export interface AdminSettingsDTO {
  allowBroadcasts: boolean;
  supportEmail: string;
  auditRetentionDays: number;
  productPolicy: PlatformPolicy;
  updatedAt: Date;
}
