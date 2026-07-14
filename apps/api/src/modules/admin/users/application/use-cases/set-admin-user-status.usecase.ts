import type {
  AdminActionMeta,
  AdminActor,
  AdminManagedUserStatus,
} from '../../domain/admin-users.types';
import { AdminUsersDomainError } from '../../domain/admin-users-domain.error';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import type { IAdminStatusResultDTO } from '../admin-users.dto';
import { AdminUsersApplicationError } from '../admin-users-application.error';

export interface ISetAdminUserStatusUseCase {
  execute(
    userId: string,
    status: AdminManagedUserStatus,
    actor: AdminActor,
    meta: AdminActionMeta
  ): Promise<IAdminStatusResultDTO>;
}
export class SetAdminUserStatusUseCase implements ISetAdminUserStatusUseCase {
  constructor(private readonly _repository: IAdminUsersRepository) {}
  async execute(
    userId: string,
    status: AdminManagedUserStatus,
    actor: AdminActor,
    meta: AdminActionMeta
  ) {
    if (!/^[a-f\d]{24}$/i.test(userId))
      throw new AdminUsersDomainError('INVALID_USER_ID', 'Invalid user ID');
    if (actor.userId === userId) throw AdminUsersApplicationError.selfStatusChange();
    const target = await this._repository.findById(userId);
    if (!target) throw AdminUsersApplicationError.userNotFound();
    if (target.role === 'superadmin')
      throw AdminUsersApplicationError.protectedAdmin('A super admin cannot be blocked');
    if (target.role === 'admin' && actor.role !== 'superadmin')
      throw AdminUsersApplicationError.protectedAdmin(
        'Only a super admin can change another admin'
      );
    await this._repository.updateStatus(userId, status);
    if (status === 'blocked') await this._repository.revokeSessions(userId);
    await this._repository.recordStatusChange({
      ...meta,
      actorId: actor.userId,
      userId,
      previousStatus: target.status,
      status,
      targetName: target.fullName,
      targetUsername: target.username,
    });
    return { userId, status };
  }
}
