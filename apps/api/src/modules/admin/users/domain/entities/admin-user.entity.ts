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
export type AdminUserDetailEntity = {
  user: AdminUserEntity;
  stats: { trackers: number; reports: number; trustScore: number; failedSecurityEvents: number };
  activity: AdminUserActivityEntity[];
  securityEvents: AdminSecurityEventEntity[];
};
