export type AdminDashboardData = {
  accessScope: 'full' | 'moderation';
  generatedAt: string;
  metrics: {
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    activeToday: number;
    blockedUsers: number;
    suspendedUsers: number;
    totalTrackers: number;
    openQuestionReports: number;
    reviewingQuestionReports: number;
    urgentSupportTickets: number;
    suspendedMockTests: number;
    openTrackerReports: number;
    suspendedTrackers: number;
    overdueQuestionReports: number;
    overdueTrackerReports: number;
    pendingContentAppeals: number;
    pendingPrivacyRequests: number;
    overduePrivacyRequests: number;
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
