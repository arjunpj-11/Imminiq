import type { AdminActor } from '../../../shared/domain';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { IAdminTrackerEmailProvider } from '../../domain/services/admin-tracker-email-provider.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminTrackerDeleteResultDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IDeleteAdminTrackerUseCase {
  execute(id: string, actor: AdminActor): Promise<AdminTrackerDeleteResultDTO>;
}

export class DeleteAdminTrackerUseCase implements IDeleteAdminTrackerUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly emailProvider: IAdminTrackerEmailProvider,
    private readonly mapper: IAdminTrackersMapper
  ) {}

  async execute(id: string, actor: AdminActor) {
    const result = await this.repository.delete(id, actor);
    if (!result) throw AdminTrackersApplicationError.trackerNotFound();
    if (result.ownerEmail) {
      await this.emailProvider.sendTrackerDeleted(result.ownerEmail, {
        ownerName: result.owner,
        trackerTitle: result.title,
      });
    }
    return this.mapper.toDeleteResultDTO(result);
  }
}
