export type AdminDashboardMetrics = {
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
};

export type AdminDashboardActivity = {
  id: string;
  action: string;
  module: string;
  severity: string;
  createdAt: Date;
  user: { fullName: string; username: string } | null;
};

export type AdminDashboardEntity = {
  generatedAt: Date;
  metrics: AdminDashboardMetrics;
  weeklyActivity: number[];
  recentActivity: AdminDashboardActivity[];
};
