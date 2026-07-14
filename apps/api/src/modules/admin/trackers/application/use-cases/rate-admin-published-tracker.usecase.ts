import type { AdminActor } from '../../../shared';
import type { AdminPublishedTrackerEngagementResult } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';

export interface IRateAdminPublishedTrackerUseCase {
  execute(
    id: string,
    rating: number,
    actor: AdminActor
  ): Promise<AdminPublishedTrackerEngagementResult>;
}

export class RateAdminPublishedTrackerUseCase implements IRateAdminPublishedTrackerUseCase {
  constructor(private readonly repository: IAdminTrackersRepository) {}

  async execute(id: string, rating: number, actor: AdminActor) {
    const result = await this.repository.ratePublished(id, rating, actor);
    if (!result) throw AdminTrackersApplicationError.publishedTrackerNotFound();
    return result;
  }
}
