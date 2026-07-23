import type { IAdminPasswordHasher } from '../../domain/services/admin-password-hasher.interface';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import { AdminUsersApplicationError } from '../admin-users-application.error';
import type { AdminRequestContextDTO, SetAdminActionPasswordResultDTO } from '../admin-users.dto';

export interface ISetAdminActionPasswordUseCase {
  execute(
    userId: string,
    password: string,
    actorId: string,
    context: AdminRequestContextDTO
  ): Promise<SetAdminActionPasswordResultDTO>;
}

export class SetAdminActionPasswordUseCase implements ISetAdminActionPasswordUseCase {
  constructor(
    private readonly _repository: Pick<
      IAdminUsersRepository,
      'findById' | 'setAdminActionPassword'
    >,
    private readonly _passwordHasher: IAdminPasswordHasher
  ) {}

  async execute(
    userId: string,
    password: string,
    actorId: string,
    context: AdminRequestContextDTO
  ) {
    if (userId === actorId) {
      throw AdminUsersApplicationError.protectedAdmin(
        'A super admin cannot assign an admin action password to their own account'
      );
    }
    const target = await this._repository.findById(userId);
    if (!target) throw AdminUsersApplicationError.userNotFound();
    if (!['admin', 'moderator'].includes(target.role)) {
      throw AdminUsersApplicationError.protectedAdmin(
        'Admin action passwords can only be assigned to admins and moderators'
      );
    }
    const passwordHash = await this._passwordHasher.hash(password);
    const updated = await this._repository.setAdminActionPassword(userId, passwordHash, {
      actorId,
      ...context,
    });
    if (!updated) throw AdminUsersApplicationError.userNotFound();
    return {
      userId,
      configured: true as const,
      ...(updated.adminActionPasswordSetAt ? { setAt: updated.adminActionPasswordSetAt } : {}),
    };
  }
}
