import type { AdminActor } from '../../../shared';
import type { AdminPublishedTrackerEngagementResult } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';

export interface ILikeAdminPublishedTrackerUseCase {
  execute(id: string, actor: AdminActor): Promise<AdminPublishedTrackerEngagementResult>;
}

export class LikeAdminPublishedTrackerUseCase implements ILikeAdminPublishedTrackerUseCase {
  constructor(private readonly repository: IAdminTrackersRepository) {}

  async execute(id: string, actor: AdminActor) {
    const result = await this.repository.likePublished(id, actor);
    if (!result) throw AdminTrackersApplicationError.publishedTrackerNotFound();
    return result;
  }
}
