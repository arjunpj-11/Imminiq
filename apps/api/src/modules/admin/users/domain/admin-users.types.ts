export type AdminUserFilter = 'all' | 'active' | 'blocked'
export type AdminManagedUserStatus = 'active' | 'blocked'
export type AdminActor = { userId: string; role: 'admin' | 'superadmin' }
export type AdminActionMeta = { ipAddress: string; userAgent: string; reason?: string }
