import type {
  AdminUserAppealEntity,
  AdminUserDetailEntity,
  AdminUserEntity,
} from '../entities/admin-user.entity';
import type {
  AdminActionMeta,
  AdminManagedUserStatus,
  AdminUserFilter,
} from '../admin-users.types';

export type ListAdminUsersInput = {
  search: string;
  status: AdminUserFilter;
  page: number;
  limit: number;
};
export type AdminUsersListResult = {
  users: AdminUserEntity[];
  stats: { total: number; active: number; paused: number; blocked: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type ListAdminUserAppealsInput = {
  search: string;
  status: 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';
  page: number;
  limit: number;
};
export type AdminUserAppealsListResult = {
  items: AdminUserAppealEntity[];
  stats: { pending: number; underReview: number; approved: number; rejected: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type RecordAdminMessageInput = {
  actorId: string;
  userId: string;
  subject: string;
  message: string;
  ipAddress: string;
  userAgent: string;
};
export type RecordAdminStatusChangeInput = AdminActionMeta & {
  actorId: string;
  userId: string;
  previousStatus: string;
  status: AdminManagedUserStatus;
  targetName: string;
  targetUsername: string;
};

export interface IAdminUsersRepository {
  list(input: ListAdminUsersInput): Promise<AdminUsersListResult>;
  listAppeals(input: ListAdminUserAppealsInput): Promise<AdminUserAppealsListResult>;
  updateAppeal(
    appealId: string,
    input: {
      status: 'under_review' | 'approved' | 'rejected';
      reviewNote: string;
      actorId: string;
      ipAddress: string;
      userAgent: string;
    }
  ): Promise<AdminUserAppealEntity | null>;
  findDetailById(userId: string): Promise<AdminUserDetailEntity | null>;
  findById(userId: string): Promise<AdminUserEntity | null>;
  updateStatus(
    userId: string,
    status: AdminManagedUserStatus,
    input: { actorId: string; reason: string; reasonCode: string }
  ): Promise<void>;
  revokeSessions(userId: string): Promise<void>;
  revokeSession(
    userId: string,
    sessionId: string,
    input: { actorId: string; ipAddress: string; userAgent: string }
  ): Promise<boolean>;
  updateRole(
    userId: string,
    role: 'user' | 'moderator' | 'admin',
    input: { actorId: string; reason: string; ipAddress: string; userAgent: string }
  ): Promise<AdminUserEntity | null>;
  recordStatusChange(input: RecordAdminStatusChangeInput): Promise<void>;
  recordAdminMessage(input: RecordAdminMessageInput): Promise<void>;
}
