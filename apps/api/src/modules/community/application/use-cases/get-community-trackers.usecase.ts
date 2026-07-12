import {
  COMMUNITY_DEFAULT_LIMIT,
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_MAX_LIMIT,
} from '../../domain/constants/community.constants'
import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'
import type { ICommunityTrackerListPayloadDTO, ICommunityTrackerListViewDTO } from '../dtos/community.dto'
import type { ICommunityMapper } from '../mappers/community.mapper'

export interface IGetCommunityTrackersUseCase {
  execute(payload: ICommunityTrackerListPayloadDTO): Promise<ICommunityTrackerListViewDTO>
}

export class GetCommunityTrackersUseCase implements IGetCommunityTrackersUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper,
  ) {}

  async execute(payload: ICommunityTrackerListPayloadDTO): Promise<ICommunityTrackerListViewDTO> {
    const page = this.normalizePage(payload.page)
    const limit = this.normalizeLimit(payload.limit)

    const result = await this._repository.findPublicTrackers({
      userId: payload.userId,
      search: payload.search,
      topics: payload.topics,
      minRating: payload.minRating,
      verifiedOnly: payload.verifiedOnly,
      sort: payload.sort,
      page,
      limit,
    })

    return this._mapper.toTrackerListView(result)
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
