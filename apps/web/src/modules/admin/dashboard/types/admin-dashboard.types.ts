export type AdminDashboardData = {
  accessScope: 'full' | 'moderation';
  metrics: {
    totalUsers: number;
    activeToday: number;
    blockedUsers: number;
    totalTrackers: number;
    openQuestionReports: number;
    reviewingQuestionReports: number;
    urgentSupportTickets: number;
    suspendedMockTests: number;
    openTrackerReports: number;
    suspendedTrackers: number;
  };
  weeklyActivity: number[];
  recentActivity: Array<{
    id: string;
    action: string;
    module: string;
    severity: string;
    createdAt: string;
    user: { fullName: string; username: string } | null;
  }>;
};
