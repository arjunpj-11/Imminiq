import type { PlatformPolicy } from '../../../../../shared/platform-policy';

export type AdminSettingsInput = {
  allowBroadcasts: boolean;
  aiMonthlyTokenBudget: number;
  aiBudgetWarningPercent: number;
  productPolicy: PlatformPolicy;
};
export type AdminSettings = AdminSettingsInput & { updatedAt: Date };
