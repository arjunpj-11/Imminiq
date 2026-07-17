export type AdminUserRole = 'user' | 'moderator' | 'admin' | 'superadmin';
export type AdminUserStatus = 'active' | 'paused' | 'blocked' | 'deactivated' | 'banned';

export type AdminUserEntity = {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  adminStatusReason?: string;
  adminStatusReasonCode?: string;
  adminStatusChangedAt?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  isPremium: boolean;
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  lastActiveAt: Date;
  createdAt: Date;
  provider: string;
  adminActionPasswordConfigured: boolean;
  adminActionPasswordSetAt?: Date;
};

export type AdminUserMessageInput = {
  subject: string;
  message: string;
  notifyEmail: boolean;
};

export type AdminUserAppealEntity = {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  identifier: string;
  appealReason: string;
  originalReason?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
};

export type AdminUserActivityEntity = {
  id: string;
  action: string;
  module: string;
  severity: string;
  createdAt: Date;
};
export type AdminSecurityEventEntity = {
  id: string;
  eventType: string;
  outcome: string;
  createdAt: Date;
  ipAddress: string;
};
export type AdminUserSessionEntity = {
  id: string;
  device: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
};
export type AdminUserDetailEntity = {
  user: AdminUserEntity;
  stats: { trackers: number; reports: number; trustScore: number; failedSecurityEvents: number };
  activity: AdminUserActivityEntity[];
  securityEvents: AdminSecurityEventEntity[];
  sessions: AdminUserSessionEntity[];
};
