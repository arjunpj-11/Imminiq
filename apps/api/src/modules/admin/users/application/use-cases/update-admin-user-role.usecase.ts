import type { AdminActor } from '../../domain/admin-users.types';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import { AdminUsersApplicationError } from '../admin-users-application.error';
import type { AdminRequestContextDTO, AdminUserDTO } from '../admin-users.dto';
import type { IAdminUsersMapper } from '../admin-users.mapper';

export interface IUpdateAdminUserRoleUseCase {
  execute(
    userId: string,
    role: 'user' | 'moderator' | 'admin',
    reason: string,
    actor: AdminActor,
    context: AdminRequestContextDTO
  ): Promise<AdminUserDTO>;
}

export class UpdateAdminUserRoleUseCase implements IUpdateAdminUserRoleUseCase {
  constructor(
    private readonly repository: Pick<IAdminUsersRepository, 'updateRole'>,
    private readonly mapper: IAdminUsersMapper
  ) {}

  async execute(
    userId: string,
    role: 'user' | 'moderator' | 'admin',
    reason: string,
    actor: AdminActor,
    context: AdminRequestContextDTO
  ) {
    if (actor.userId === userId) throw AdminUsersApplicationError.selfStatusChange();
    const user = await this.repository.updateRole(userId, role, {
      actorId: actor.userId,
      reason,
      ...context,
    });
    if (!user) {
      throw AdminUsersApplicationError.protectedAdmin('Superadmin roles cannot be changed here');
    }
    return this.mapper.toUserDTO(user);
  }
}
