import {
  COMMUNITY_DEFAULT_LIMIT,
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_MAX_LIMIT,
} from '../../domain/constants/community.constants'
import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'
import type { ICommunityVerificationQueueViewDTO, IVerificationQueuePayloadDTO } from '../dtos/community.dto'
import type { ICommunityMapper } from '../mappers/community.mapper'

export class GetVerificationQueueUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper,
  ) {}

  async execute(payload: IVerificationQueuePayloadDTO): Promise<ICommunityVerificationQueueViewDTO> {
    const page = this.normalizePage(payload.page)
    const limit = this.normalizeLimit(payload.limit)
    const queue = await this._repository.findVerificationQueue({
      userId: payload.userId,
      page,
      limit,
    })

    return this._mapper.toVerificationQueueView(queue)
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
