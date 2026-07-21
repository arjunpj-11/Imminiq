import type { AdminActor } from '../../../../../shared/admin';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminPublishedTrackerEngagementResultDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IRateAdminPublishedTrackerUseCase {
  execute(
    id: string,
    rating: number,
    actor: AdminActor
  ): Promise<AdminPublishedTrackerEngagementResultDTO>;
}

export class RateAdminPublishedTrackerUseCase implements IRateAdminPublishedTrackerUseCase {
  constructor(
    private readonly _repository: Pick<IAdminTrackersRepository, 'ratePublished'>,
    private readonly _mapper: IAdminTrackersMapper
  ) {}

  async execute(id: string, rating: number, actor: AdminActor) {
    const result = await this._repository.ratePublished(id, rating, actor);
    if (!result) throw AdminTrackersApplicationError.publishedTrackerNotFound();
    return this._mapper.toEngagementResultDTO(result);
  }
}
