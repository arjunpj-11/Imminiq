import type { PlatformPolicy } from '../../../../shared/platform-policy';

export interface AdminSettingsDTO {
  maintenanceMode: boolean;
  allowBroadcasts: boolean;
  supportEmail: string;
  auditRetentionDays: number;
  productPolicy: PlatformPolicy;
  updatedAt: Date;
}
