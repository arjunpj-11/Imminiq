import type { AdminUserDetailEntity, AdminUserEntity } from '../domain/entities/admin-user.entity';
import type { AdminUserAppealsListResult } from '../domain/repositories/admin-users.repository.interface';
import type { AdminActor } from '../domain/admin-users.types';

export type AdminUserDTO = Omit<AdminUserEntity, 'id'> & { _id: string };
export type AdminUsersListDTO = {
  users: AdminUserDTO[];
  stats: { total: number; active: number; paused: number; blocked: number };
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

export type AdminRequestContextDTO = {
  ipAddress: string;
  userAgent: string;
};

export type AdminUserAppealUpdateInputDTO = {
  status: 'under_review' | 'approved' | 'rejected';
  reviewNote: string;
};

export type AdminUserAppealActorDTO = Pick<AdminActor, 'userId'>;

export type AdminUserAppealUpdateMetaDTO = AdminRequestContextDTO & {
  notifyEmail: boolean;
};

export type RevokeAdminUserSessionResultDTO = {
  userId: string;
  sessionId: string;
  revoked: true;
};

export type SetAdminActionPasswordResultDTO = {
  userId: string;
  configured: true;
  setAt?: Date;
};
