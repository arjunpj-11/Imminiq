import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'
import type { ICommunityLeaderboardEntryViewDTO } from '../dtos/community.dto'
import {
  COMMUNITY_DEFAULT_LEADERBOARD_LIMIT,
  COMMUNITY_MAX_LEADERBOARD_LIMIT,
} from '../constants/community.constants'
import type { ICommunityMapper } from '../mappers/community.mapper'

export class GetVerificationLeaderboardUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper,
  ) {}

  async execute(userId: string, limit?: number): Promise<ICommunityLeaderboardEntryViewDTO[]> {
    const safeLimit = this.normalizeLimit(limit)
    const leaderboard = await this._repository.findVerificationLeaderboard(userId, safeLimit)

    return leaderboard.map((entry) => this._mapper.toLeaderboardEntryView(entry))
  }

  private normalizeLimit(limit?: number): number {
    if (!limit || limit < 1) {
      return COMMUNITY_DEFAULT_LEADERBOARD_LIMIT
    }

    return Math.min(Math.floor(limit), COMMUNITY_MAX_LEADERBOARD_LIMIT)
  }
}
