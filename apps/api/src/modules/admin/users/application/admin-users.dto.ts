import type { AdminUserDetailEntity, AdminUserEntity } from '../domain/entities/admin-user.entity';

export type AdminUserDTO = Omit<AdminUserEntity, 'id'> & { _id: string };
export type AdminUsersListDTO = {
  users: AdminUserDTO[];
  stats: { total: number; active: number; blocked: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type AdminUserDetailDTO = Omit<AdminUserDetailEntity, 'user'> & { user: AdminUserDTO };
export type AdminStatusResultDTO = { userId: string; status: 'active' | 'blocked' };
