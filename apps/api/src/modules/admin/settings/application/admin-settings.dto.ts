import type { PlatformPolicy } from '../../../../shared/platform-policy';

export interface AdminSettingsDTO {
  allowBroadcasts: boolean;
  aiMonthlyTokenBudget: number;
  aiBudgetWarningPercent: number;
  productPolicy: PlatformPolicy;
  updatedAt: Date;
}
