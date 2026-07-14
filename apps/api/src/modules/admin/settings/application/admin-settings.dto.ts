export interface IAdminSettingsDTO {
  maintenanceMode: boolean;
  allowBroadcasts: boolean;
  supportEmail: string;
  auditRetentionDays: number;
  updatedAt: Date;
}
