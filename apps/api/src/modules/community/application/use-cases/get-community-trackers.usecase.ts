import {
  COMMUNITY_DEFAULT_LIMIT,
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_MAX_LIMIT,
} from '../../domain/constants/community.constants'
import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityTrackerListPayload, CommunityTrackerListView } from '../dtos/community.dto'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class GetCommunityTrackersUseCase {
  constructor(
    private readonly repository: CommunityRepositoryContract,
    private readonly mapper: CommunityMapperContract,
  ) {}

  async execute(payload: CommunityTrackerListPayload): Promise<CommunityTrackerListView> {
    const page = this.normalizePage(payload.page)
    const limit = this.normalizeLimit(payload.limit)

    const result = await this.repository.findPublicTrackers({
      userId: payload.userId,
      search: payload.search,
      topics: payload.topics,
      minRating: payload.minRating,
      verifiedOnly: payload.verifiedOnly,
      sort: payload.sort,
      page,
      limit,
    })

    return this.mapper.toTrackerListView(result)
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
