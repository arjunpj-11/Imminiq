import type { AdminActor } from '../../../../../shared/admin';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminPublishedTrackerEngagementResultDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface ILikeAdminPublishedTrackerUseCase {
  execute(id: string, actor: AdminActor): Promise<AdminPublishedTrackerEngagementResultDTO>;
}

export class LikeAdminPublishedTrackerUseCase implements ILikeAdminPublishedTrackerUseCase {
  constructor(
    private readonly _repository: Pick<IAdminTrackersRepository, 'likePublished'>,
    private readonly _mapper: IAdminTrackersMapper
  ) {}

  async execute(id: string, actor: AdminActor) {
    const result = await this._repository.likePublished(id, actor);
    if (!result) throw AdminTrackersApplicationError.publishedTrackerNotFound();
    return this._mapper.toEngagementResultDTO(result);
  }
}
