import type { AdminActor } from '../../../shared';
import type { AdminTrackerDeleteResult } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { IAdminTrackerEmailProvider } from '../../domain/services/admin-tracker-email-provider.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';

export interface IDeleteAdminTrackerUseCase {
  execute(id: string, actor: AdminActor): Promise<AdminTrackerDeleteResult>;
}

export class DeleteAdminTrackerUseCase implements IDeleteAdminTrackerUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly emailProvider: IAdminTrackerEmailProvider
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
    return result;
  }
}
