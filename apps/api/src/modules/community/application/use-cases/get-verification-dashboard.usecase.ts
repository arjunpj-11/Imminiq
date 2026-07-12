import {
  COMMUNITY_DEFAULT_LIMIT,
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_MAX_LIMIT,
} from '../../domain/constants/community.constants'
import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'
import type { ICommunityVerificationDashboardViewDTO, IVerificationQueuePayloadDTO } from '../dtos/community.dto'
import { COMMUNITY_DEFAULT_LEADERBOARD_LIMIT } from '../../domain/constants/community.constants'
import type { ICommunityMapper } from '../mappers/community.mapper'

export interface IGetVerificationDashboardUseCase {
  execute(payload: IVerificationQueuePayloadDTO): Promise<ICommunityVerificationDashboardViewDTO>
}

export class GetVerificationDashboardUseCase implements IGetVerificationDashboardUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper,
  ) {}

  async execute(
    payload: IVerificationQueuePayloadDTO,
  ): Promise<ICommunityVerificationDashboardViewDTO> {
    const page = this.normalizePage(payload.page)
    const limit = this.normalizeLimit(payload.limit)

    const [stats, queue, leaderboard] = await Promise.all([
      this._repository.getVerificationStats(payload.userId),
      this._repository.findVerificationQueue({
        userId: payload.userId,
        page,
        limit,
      }),
      this._repository.findVerificationLeaderboard(
        payload.userId,
        COMMUNITY_DEFAULT_LEADERBOARD_LIMIT,
      ),
    ])

    const queueView = this._mapper.toVerificationQueueView(queue)

    return {
      ...queueView,
      stats: this._mapper.toVerificationStatsView(stats),
      leaderboard: leaderboard.map((entry) =>
        this._mapper.toLeaderboardEntryView(entry),
      ),
      howItWorks: [
        'Pick a tracker from the queue',
        'Preview the submitted changes',
        'Vote Pass or Fail',
        `Earn +${stats.rewardCoins} coins if in majority`,
      ],
    }
  }

  private normalizePage(page?: number): number {
    if (!page || page < 1) {
      return COMMUNITY_DEFAULT_PAGE
    }

    return Math.floor(page)
  }

  private normalizeLimit(limit?: number): number {
    if (!limit || limit < 1) {
      return COMMUNITY_DEFAULT_LIMIT
    }

    return Math.min(Math.floor(limit), COMMUNITY_MAX_LIMIT)
  }
}
