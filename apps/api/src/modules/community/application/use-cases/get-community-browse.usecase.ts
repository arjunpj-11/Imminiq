import {
  COMMUNITY_DEFAULT_LIMIT,
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_MAX_LIMIT,
} from '../../domain/constants/community.constants'
import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityBrowseView, CommunityTrackerListPayload } from '../dtos/community.dto'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class GetCommunityBrowseUseCase {
  constructor(
    private readonly repository: CommunityRepositoryContract,
    private readonly mapper: CommunityMapperContract,
  ) {}

  async execute(payload: CommunityTrackerListPayload): Promise<CommunityBrowseView> {
    const page = this.normalizePage(payload.page)
    const limit = this.normalizeLimit(payload.limit)

    const [trackers, stats, topics, verifyStats] = await Promise.all([
      this.repository.findPublicTrackers({
        userId: payload.userId,
        search: payload.search,
        topics: payload.topics,
        minRating: payload.minRating,
        verifiedOnly: payload.verifiedOnly,
        sort: payload.sort,
        page,
        limit,
      }),
      this.repository.getPersonalStats(payload.userId),
      this.repository.findAvailableTopics(),
      this.repository.getVerificationStats(payload.userId),
    ])

    const trackerList = this.mapper.toTrackerListView(trackers)

    return {
      ...trackerList,
      stats: this.mapper.toStatCards(stats),
      topics,
      verifyBanner: {
        queueCount: verifyStats.queueCount,
        rewardCoins: verifyStats.rewardCoins,
        activeReviewersThisWeek: verifyStats.activeReviewersThisWeek,
      },
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
