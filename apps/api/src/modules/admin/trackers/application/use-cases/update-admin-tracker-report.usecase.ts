import type { AdminActor } from '../../../../../shared/admin';
import type { AdminTrackerReportUpdateInput } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminTrackerReport } from '../../domain/entities/admin-tracker.entity';

export interface IUpdateAdminTrackerReportUseCase {
  execute(
    id: string,
    input: AdminTrackerReportUpdateInput,
    actor: AdminActor
  ): Promise<AdminTrackerReport>;
}

export class UpdateAdminTrackerReportUseCase implements IUpdateAdminTrackerReportUseCase {
  constructor(private readonly repository: IAdminTrackersRepository) {}
  async execute(id: string, input: AdminTrackerReportUpdateInput, actor: AdminActor) {
    const result = await this.repository.updateReport(id, input, actor);
    if (!result) throw AdminTrackersApplicationError.reportNotFound();
    return result;
  }
}
