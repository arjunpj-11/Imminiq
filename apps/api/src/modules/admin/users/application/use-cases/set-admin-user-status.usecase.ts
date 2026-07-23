import type {
  AdminActionMeta,
  AdminActor,
  AdminManagedUserStatus,
} from '../../domain/admin-users.types';
import { AdminUsersDomainError } from '../../domain/admin-users-domain.error';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import type { AdminStatusResultDTO } from '../admin-users.dto';
import { AdminUsersApplicationError } from '../admin-users-application.error';
import type { IAdminUserEmailProvider } from '../../domain/services/admin-user-email-provider.interface';

export interface ISetAdminUserStatusUseCase {
  execute(
    userId: string,
    status: AdminManagedUserStatus,
    actor: AdminActor,
    meta: AdminActionMeta
  ): Promise<AdminStatusResultDTO>;
}
export class SetAdminUserStatusUseCase implements ISetAdminUserStatusUseCase {
  constructor(
    private readonly _repository: Pick<
      IAdminUsersRepository,
      'findById' | 'recordStatusChange' | 'revokeSessions' | 'updateStatus'
    >,
    private readonly _emailProvider: IAdminUserEmailProvider
  ) {}
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
      throw AdminUsersApplicationError.protectedAdmin(
        'A super admin account status cannot be changed'
      );
    if (target.role === 'admin' && actor.role !== 'superadmin')
      throw AdminUsersApplicationError.protectedAdmin(
        'Only a super admin can change another admin'
      );
    await this._repository.updateStatus(userId, status, {
      actorId: actor.userId,
      reason: meta.reason,
      reasonCode: meta.reasonCode,
    });
    if (status === 'blocked' || status === 'paused') await this._repository.revokeSessions(userId);
    await this._repository.recordStatusChange({
      ...meta,
      actorId: actor.userId,
      userId,
      previousStatus: target.status,
      status,
      targetName: target.fullName,
      targetUsername: target.username,
    });
    let emailQueued = false;
    if (meta.notifyEmail && target.email) {
      try {
        await this._emailProvider.queueStatusEmail({
          to: target.email,
          userName: target.fullName,
          status,
          reason: meta.reason,
        });
        emailQueued = true;
      } catch {
        // The database decision and in-app notification remain authoritative.
      }
    }
    return { userId, status, emailQueued };
  }
}
