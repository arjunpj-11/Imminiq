export type AdminSettingsInput = {
  maintenanceMode: boolean;
  allowBroadcasts: boolean;
  supportEmail: string;
  auditRetentionDays: number;
};
export type AdminSettings = AdminSettingsInput & { updatedAt: Date };
