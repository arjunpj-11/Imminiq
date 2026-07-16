import type { AdminActor } from '../../../shared/domain';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import { AdminUsersApplicationError } from '../admin-users-application.error';

export interface IRevokeAdminUserSessionUseCase {
  execute(
    userId: string,
    sessionId: string,
    actor: AdminActor,
    context: { ipAddress: string; userAgent: string }
  ): Promise<{ userId: string; sessionId: string; revoked: true }>;
}

export class RevokeAdminUserSessionUseCase implements IRevokeAdminUserSessionUseCase {
  constructor(private readonly repository: IAdminUsersRepository) {}

  async execute(
    userId: string,
    sessionId: string,
    actor: AdminActor,
    context: { ipAddress: string; userAgent: string }
  ) {
    const revoked = await this.repository.revokeSession(userId, sessionId, {
      actorId: actor.userId,
      ...context,
    });
    if (!revoked) throw AdminUsersApplicationError.userNotFound();
    return { userId, sessionId, revoked: true as const };
  }
}
