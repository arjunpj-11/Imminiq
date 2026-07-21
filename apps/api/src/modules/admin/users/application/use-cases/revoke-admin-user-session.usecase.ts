import type { AdminActor } from '../../../../../shared/admin';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import { AdminUsersApplicationError } from '../admin-users-application.error';
import type {
  AdminRequestContextDTO,
  RevokeAdminUserSessionResultDTO,
} from '../admin-users.dto';

export interface IRevokeAdminUserSessionUseCase {
  execute(
    userId: string,
    sessionId: string,
    actor: AdminActor,
    context: AdminRequestContextDTO
  ): Promise<RevokeAdminUserSessionResultDTO>;
}

export class RevokeAdminUserSessionUseCase implements IRevokeAdminUserSessionUseCase {
  constructor(private readonly _repository: Pick<IAdminUsersRepository, 'revokeSession'>) {}

  async execute(
    userId: string,
    sessionId: string,
    actor: AdminActor,
    context: AdminRequestContextDTO
  ) {
    const revoked = await this._repository.revokeSession(userId, sessionId, {
      actorId: actor.userId,
      ...context,
    });
    if (!revoked) throw AdminUsersApplicationError.userNotFound();
    return { userId, sessionId, revoked: true as const };
  }
}
