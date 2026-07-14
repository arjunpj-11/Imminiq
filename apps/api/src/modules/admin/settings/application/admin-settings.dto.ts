export interface AdminSettingsDTO {
  maintenanceMode: boolean;
  allowBroadcasts: boolean;
  supportEmail: string;
  auditRetentionDays: number;
  updatedAt: Date;
}
