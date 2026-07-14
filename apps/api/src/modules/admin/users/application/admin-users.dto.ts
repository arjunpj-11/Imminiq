import type { AdminUserDetailEntity, AdminUserEntity } from '../domain/entities/admin-user.entity';

export type IAdminUserDTO = Omit<AdminUserEntity, 'id'> & { _id: string };
export type IAdminUsersListDTO = {
  users: IAdminUserDTO[];
  stats: { total: number; active: number; blocked: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type IAdminUserDetailDTO = Omit<AdminUserDetailEntity, 'user'> & { user: IAdminUserDTO };
export type IAdminStatusResultDTO = { userId: string; status: 'active' | 'blocked' };
