import type { AdminUserDetailEntity, AdminUserEntity } from '../entities/admin-user.entity';
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
  stats: { total: number; active: number; blocked: number };
  pagination: { page: number; limit: number; total: number; pages: number };
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
  findDetailById(userId: string): Promise<AdminUserDetailEntity | null>;
  findById(userId: string): Promise<AdminUserEntity | null>;
  updateStatus(userId: string, status: AdminManagedUserStatus): Promise<void>;
  revokeSessions(userId: string): Promise<void>;
  recordStatusChange(input: RecordAdminStatusChangeInput): Promise<void>;
}
