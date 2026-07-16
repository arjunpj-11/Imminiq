export interface AdminDashboardDTO {
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
    createdAt: Date;
    user: { fullName: string; username: string } | null;
  }>;
}
