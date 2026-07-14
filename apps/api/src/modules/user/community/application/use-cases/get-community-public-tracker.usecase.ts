import type { ICommunityReviewRepository } from '../../domain/repositories/community-review.repository.interface';
import type { CommunityPublicTrackerDetailViewDTO } from '../community-review.dto';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityReviewMapper } from '../community-review.mapper';

export interface IGetCommunityPublicTrackerUseCase {
  execute(trackerId: string, userId: string): Promise<CommunityPublicTrackerDetailViewDTO>;
}

export class GetCommunityPublicTrackerUseCase implements IGetCommunityPublicTrackerUseCase {
  constructor(
    private readonly _repository: ICommunityReviewRepository,
    private readonly _mapper: ICommunityReviewMapper
  ) {}

  async execute(trackerId: string, userId: string): Promise<CommunityPublicTrackerDetailViewDTO> {
    const tracker = await this._repository.findPublicTrackerDetail(trackerId, userId);

    if (!tracker) {
      throw CommunityApplicationError.notFound('Community tracker not found');
    }

    return this._mapper.toPublicTrackerDetailView(tracker);
  }
}
