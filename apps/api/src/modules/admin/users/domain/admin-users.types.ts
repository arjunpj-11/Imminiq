export type AdminUserFilter =
  | 'all'
  | 'active'
  | 'paused'
  | 'blocked'
  | 'deactivated'
  | 'banned';
export type AdminManagedUserStatus = 'active' | 'paused' | 'blocked';
export type AdminActor = { userId: string; role: 'admin' | 'superadmin' };
export type AdminActionMeta = {
  ipAddress: string;
  userAgent: string;
  reason: string;
  reasonCode: string;
  notifyEmail: boolean;
};
