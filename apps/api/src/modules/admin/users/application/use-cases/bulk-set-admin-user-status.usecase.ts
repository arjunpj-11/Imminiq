import type { AdminBulkActionResult } from '../../../../../shared/admin';
import type { AdminActor } from '../../domain/admin-users.types';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import type { AdminRequestContextDTO, AdminUserBulkStatusInputDTO } from '../admin-users.dto';
import type { ISetAdminUserStatusUseCase } from './set-admin-user-status.usecase';

export interface IBulkSetAdminUserStatusUseCase {
  execute(
    input: AdminUserBulkStatusInputDTO,
    actor: AdminActor,
    context: AdminRequestContextDTO
  ): Promise<AdminBulkActionResult>;
}

export class BulkSetAdminUserStatusUseCase implements IBulkSetAdminUserStatusUseCase {
  constructor(
    private readonly _repository: Pick<IAdminUsersRepository, 'findById'>,
    private readonly _setStatus: ISetAdminUserStatusUseCase
  ) {}

  async execute(
    input: AdminUserBulkStatusInputDTO,
    actor: AdminActor,
    context: AdminRequestContextDTO
  ): Promise<AdminBulkActionResult> {
    if (input.preview) {
      const candidates = await Promise.all(
        input.userIds.map(async (id) => ({ id, user: await this._repository.findById(id) }))
      );

      return {
        requested: input.userIds.length,
        eligible: candidates
          .filter((item) => item.user && item.id !== actor.userId)
          .map((item) => item.id),
        blocked: candidates
          .filter((item) => !item.user || item.id === actor.userId)
          .map((item) => ({
            id: item.id,
            reason: item.id === actor.userId ? 'self_action' : 'not_found',
          })),
      };
    }

    const settled = await Promise.allSettled(
      input.userIds.map((id) =>
        this._setStatus.execute(id, input.status, actor, {
          ...context,
          reason: input.reason,
          reasonCode: input.reasonCode,
          notifyEmail: input.notifyEmail,
        })
      )
    );
    const results = settled.map((result, index) =>
      result.status === 'fulfilled'
        ? { id: input.userIds[index], success: true }
        : {
            id: input.userIds[index],
            success: false,
            error: result.reason instanceof Error ? result.reason.message : 'Failed',
          }
    );

    return {
      succeeded: results.filter((item) => item.success).length,
      failed: results.filter((item) => !item.success).length,
      results,
    };
  }
}
