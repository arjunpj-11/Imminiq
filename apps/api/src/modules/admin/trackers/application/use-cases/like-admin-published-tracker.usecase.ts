import type { AdminActor } from '../../../shared';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { IAdminPublishedTrackerEngagementResultDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface ILikeAdminPublishedTrackerUseCase {
  execute(id: string, actor: AdminActor): Promise<IAdminPublishedTrackerEngagementResultDTO>;
}

export class LikeAdminPublishedTrackerUseCase implements ILikeAdminPublishedTrackerUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly mapper: IAdminTrackersMapper
  ) {}

  async execute(id: string, actor: AdminActor) {
    const result = await this.repository.likePublished(id, actor);
    if (!result) throw AdminTrackersApplicationError.publishedTrackerNotFound();
    return this.mapper.toEngagementResultDTO(result);
  }
}
