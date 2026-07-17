import type { ISecurityPasswordHasher } from '../../../../security';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import { AdminUsersApplicationError } from '../admin-users-application.error';

export interface ISetAdminActionPasswordUseCase {
  execute(
    userId: string,
    password: string,
    actorId: string,
    context: { ipAddress: string; userAgent: string }
  ): Promise<{ userId: string; configured: true; setAt?: Date }>;
}

export class SetAdminActionPasswordUseCase implements ISetAdminActionPasswordUseCase {
  constructor(
    private readonly repository: IAdminUsersRepository,
    private readonly passwordHasher: ISecurityPasswordHasher
  ) {}

  async execute(
    userId: string,
    password: string,
    actorId: string,
    context: { ipAddress: string; userAgent: string }
  ) {
    if (userId === actorId) {
      throw AdminUsersApplicationError.protectedAdmin(
        'A super admin cannot assign an admin action password to their own account'
      );
    }
    const target = await this.repository.findById(userId);
    if (!target) throw AdminUsersApplicationError.userNotFound();
    if (!['admin', 'moderator'].includes(target.role)) {
      throw AdminUsersApplicationError.protectedAdmin(
        'Admin action passwords can only be assigned to admins and moderators'
      );
    }
    const passwordHash = await this.passwordHasher.hash(password);
    const updated = await this.repository.setAdminActionPassword(userId, passwordHash, {
      actorId,
      ...context,
    });
    if (!updated) throw AdminUsersApplicationError.userNotFound();
    return {
      userId,
      configured: true as const,
      ...(updated.adminActionPasswordSetAt
        ? { setAt: updated.adminActionPasswordSetAt }
        : {}),
    };
  }
}
