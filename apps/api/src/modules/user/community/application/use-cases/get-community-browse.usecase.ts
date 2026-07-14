import {
  COMMUNITY_DEFAULT_LIMIT,
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_MAX_LIMIT,
} from '../../domain/community.constants';
import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import type { CommunityBrowseViewDTO, CommunityTrackerListPayloadDTO } from '../community.dto';
import type { ICommunityMapper } from '../community.mapper';
import type { ICommunityPolicyReader } from '../../../../../shared/platform-policy';

export interface IGetCommunityBrowseUseCase {
  execute(payload: CommunityTrackerListPayloadDTO): Promise<CommunityBrowseViewDTO>;
}

export class GetCommunityBrowseUseCase implements IGetCommunityBrowseUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper,
    private readonly _policyReader: ICommunityPolicyReader
  ) {}

  async execute(payload: CommunityTrackerListPayloadDTO): Promise<CommunityBrowseViewDTO> {
    const page = this.normalizePage(payload.page);
    const limit = this.normalizeLimit(payload.limit);

    const [trackers, stats, topics, verifyStats, policy] = await Promise.all([
      this._repository.findPublicTrackers({
        userId: payload.userId,
        search: payload.search,
        topics: payload.topics,
        minRating: payload.minRating,
        verifiedOnly: payload.verifiedOnly,
        sort: payload.sort,
        page,
        limit,
      }),
      this._repository.getPersonalStats(payload.userId),
      this._repository.findAvailableTopics(),
      this._repository.getVerificationStats(payload.userId),
      this._policyReader.getCommunityPolicy(),
    ]);

    const trackerList = this._mapper.toTrackerListView(trackers);

    return {
      ...trackerList,
      stats: this._mapper.toStatCards(stats),
      topics,
      verifyBanner: {
        queueCount: verifyStats.queueCount,
        rewardCoins: policy.reviewRewardCoins,
        activeReviewersThisWeek: verifyStats.activeReviewersThisWeek,
      },
    };
  }

  private normalizePage(page?: number): number {
    if (!page || page < 1) {
      return COMMUNITY_DEFAULT_PAGE;
    }

    return Math.floor(page);
  }

  private normalizeLimit(limit?: number): number {
    if (!limit || limit < 1) {
      return COMMUNITY_DEFAULT_LIMIT;
    }

    return Math.min(Math.floor(limit), COMMUNITY_MAX_LIMIT);
  }
}
