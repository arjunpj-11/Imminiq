export type AdminUserStatus =
  "active" | "paused" | "blocked" | "deactivated" | "banned";
export type AdminUser = {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  status: AdminUserStatus;
  adminStatusReason?: string;
  adminStatusReasonCode?: string;
  adminStatusChangedAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isPremium?: boolean;
  coins?: number;
  xp?: number;
  level?: number;
  streakCount?: number;
  lastActiveAt: string;
  createdAt: string;
  provider?: string;
};
export type AdminUsersData = {
  users: AdminUser[];
  stats: { total: number; active: number; paused: number; blocked: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type AdminUserStatusPayload = {
  status: "active" | "paused" | "blocked";
  reasonCode:
    | "policy_violation"
    | "security_risk"
    | "spam_or_abuse"
    | "payment_or_fraud"
    | "appeal_accepted"
    | "other";
  reason: string;
  notifyEmail: boolean;
  mfaCode?: string;
};
export type AdminUserMessagePayload = {
  subject: string;
  message: string;
  notifyEmail: boolean;
};
export type AdminUserAppeal = {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  identifier: string;
  appealReason: string;
  originalReason?: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
};
export type AdminUserAppealsData = {
  items: AdminUserAppeal[];
  stats: {
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type AdminUserAppealUpdatePayload = {
  status: "under_review" | "approved" | "rejected";
  reviewNote: string;
  notifyEmail: boolean;
  mfaCode?: string;
};
export type AdminPrivacyRequest = {
  id: string;
  userId: string;
  userName: string;
  identifier: string;
  type: "access" | "export" | "delete" | "correction";
  details: string;
  status: "pending" | "in_progress" | "completed" | "rejected" | "cancelled";
  assignedTo?: string;
  resolutionNote?: string;
  downloadUrl?: string;
  dueAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
export type AdminPrivacyRequestsData = {
  items: AdminPrivacyRequest[];
  stats: {
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type AdminUserDetailData = {
  user: AdminUser;
  stats: {
    trackers: number;
    reports: number;
    trustScore: number;
    failedSecurityEvents: number;
  };
  activity: Array<{
    id: string;
    action: string;
    module: string;
    severity: string;
    createdAt: string;
  }>;
  securityEvents: Array<{
    id: string;
    eventType: string;
    outcome: string;
    createdAt: string;
    ipAddress: string;
  }>;
  sessions: Array<{
    id: string;
    device: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    lastActiveAt: string;
    expiresAt: string;
  }>;
};
