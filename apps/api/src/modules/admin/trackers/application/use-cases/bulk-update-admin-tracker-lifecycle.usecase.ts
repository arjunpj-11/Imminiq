import type { AdminActor, AdminBulkActionResult } from '../../../../../shared/admin';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { AdminTrackerBulkLifecycleInputDTO } from '../admin-trackers.dto';
import type { IUpdateAdminTrackerLifecycleUseCase } from './update-admin-tracker-lifecycle.usecase';

export interface IBulkUpdateAdminTrackerLifecycleUseCase {
  execute(
    input: AdminTrackerBulkLifecycleInputDTO,
    actor: AdminActor
  ): Promise<AdminBulkActionResult>;
}

export class BulkUpdateAdminTrackerLifecycleUseCase implements IBulkUpdateAdminTrackerLifecycleUseCase {
  constructor(
    private readonly _repository: Pick<IAdminTrackersRepository, 'getDetail'>,
    private readonly _updateLifecycle: IUpdateAdminTrackerLifecycleUseCase
  ) {}

  async execute(
    input: AdminTrackerBulkLifecycleInputDTO,
    actor: AdminActor
  ): Promise<AdminBulkActionResult> {
    if (input.preview) {
      const candidates = await Promise.all(
        input.ids.map(async (id) => ({ id, exists: Boolean(await this._repository.getDetail(id)) }))
      );

      return {
        requested: input.ids.length,
        eligible: candidates.filter((item) => item.exists).map((item) => item.id),
        blocked: candidates
          .filter((item) => !item.exists)
          .map((item) => ({ id: item.id, reason: 'not_found' })),
      };
    }

    const { ids, preview: _preview, ...lifecycle } = input;
    const settled = await Promise.allSettled(
      ids.map((id) => this._updateLifecycle.execute(id, lifecycle, actor))
    );
    const results = settled.map((result, index) =>
      result.status === 'fulfilled'
        ? { id: ids[index], success: true }
        : {
            id: ids[index],
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
