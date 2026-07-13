export interface IAdminDashboardDTO {
  metrics: {
    totalUsers: number;
    activeToday: number;
    blockedUsers: number;
    totalTrackers: number;
  };
  weeklyActivity: number[];
  recentActivity: Array<{
    id: string;
    action: string;
    module: string;
    severity: string;
    createdAt: Date;
    user: { fullName: string; username: string } | null;
  }>;
}
