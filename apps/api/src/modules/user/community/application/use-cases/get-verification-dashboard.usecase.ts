import {
  COMMUNITY_DEFAULT_LIMIT,
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_MAX_LIMIT,
} from '../../domain/community.constants';
import type { ICommunityVerificationRepository } from '../../domain/repositories/community-verification.repository.interface';
import type {
  CommunityVerificationDashboardViewDTO,
  VerificationQueuePayloadDTO,
} from '../community.dto';
import { COMMUNITY_DEFAULT_LEADERBOARD_LIMIT } from '../../domain/community.constants';
import type { ICommunityMapper } from '../community.mapper';
import type { ICommunityPolicyReader } from '../../../../../shared/platform-policy';

export interface IGetVerificationDashboardUseCase {
  execute(payload: VerificationQueuePayloadDTO): Promise<CommunityVerificationDashboardViewDTO>;
}

export class GetVerificationDashboardUseCase implements IGetVerificationDashboardUseCase {
  constructor(
    private readonly _repository: ICommunityVerificationRepository,
    private readonly _mapper: ICommunityMapper,
    private readonly _policyReader: ICommunityPolicyReader
  ) {}

  async execute(
    payload: VerificationQueuePayloadDTO
  ): Promise<CommunityVerificationDashboardViewDTO> {
    const page = this.normalizePage(payload.page);
    const limit = this.normalizeLimit(payload.limit);

    const [stats, queue, leaderboard, policy] = await Promise.all([
      this._repository.getVerificationStats(payload.userId),
      this._repository.findVerificationQueue({
        userId: payload.userId,
        page,
        limit,
      }),
      this._repository.findVerificationLeaderboard(
        payload.userId,
        COMMUNITY_DEFAULT_LEADERBOARD_LIMIT
      ),
      this._policyReader.getCommunityPolicy(),
    ]);

    const queueView = this._mapper.toVerificationQueueView(queue);

    return {
      ...queueView,
      stats: this._mapper.toVerificationStatsView({
        ...stats,
        rewardCoins: policy.reviewRewardCoins,
      }),
      leaderboard: leaderboard.map((entry) => this._mapper.toLeaderboardEntryView(entry)),
      howItWorks: [
        'Pick a tracker from the queue',
        'Preview the submitted changes',
        'Vote Pass or Fail',
        `Earn +${policy.reviewRewardCoins} coins if in majority`,
      ],
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
