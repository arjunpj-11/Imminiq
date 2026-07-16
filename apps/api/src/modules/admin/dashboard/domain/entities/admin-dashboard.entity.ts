export type AdminDashboardMetrics = {
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

export type AdminDashboardActivity = {
  id: string;
  action: string;
  module: string;
  severity: string;
  createdAt: Date;
  user: { fullName: string; username: string } | null;
};

export type AdminDashboardEntity = {
  metrics: AdminDashboardMetrics;
  weeklyActivity: number[];
  recentActivity: AdminDashboardActivity[];
};
