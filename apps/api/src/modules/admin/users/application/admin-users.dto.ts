import type { AdminUserDetailEntity, AdminUserEntity } from '../domain/entities/admin-user.entity';
import type { AdminUserAppealsListResult } from '../domain/repositories/admin-users.repository.interface';

export type AdminUserDTO = Omit<AdminUserEntity, 'id'> & { _id: string };
export type AdminUsersListDTO = {
  users: AdminUserDTO[];
  stats: { total: number; active: number; paused: number; blocked: number; unverified: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type AdminUserDetailDTO = Omit<AdminUserDetailEntity, 'user'> & { user: AdminUserDTO };
export type AdminStatusResultDTO = {
  userId: string;
  status: 'active' | 'paused' | 'blocked';
  emailQueued: boolean;
};
export type AdminUserMessageResultDTO = { userId: string; emailQueued: boolean };
export type AdminUserAppealsListDTO = AdminUserAppealsListResult;
export type AdminUserAppealUpdateResultDTO = {
  appeal: AdminUserAppealsListResult['items'][number];
  emailQueued: boolean;
};
