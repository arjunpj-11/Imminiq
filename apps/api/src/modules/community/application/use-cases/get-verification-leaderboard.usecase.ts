import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityLeaderboardEntryView } from '../dtos/community.dto'
import {
  COMMUNITY_DEFAULT_LEADERBOARD_LIMIT,
  COMMUNITY_MAX_LEADERBOARD_LIMIT,
} from '../constants/community.constants'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class GetVerificationLeaderboardUseCase {
  constructor(
    private readonly repository: CommunityRepositoryContract,
    private readonly mapper: CommunityMapperContract,
  ) {}

  async execute(userId: string, limit?: number): Promise<CommunityLeaderboardEntryView[]> {
    const safeLimit = this.normalizeLimit(limit)
    const leaderboard = await this.repository.findVerificationLeaderboard(userId, safeLimit)

    return leaderboard.map((entry) => this.mapper.toLeaderboardEntryView(entry))
  }

  private normalizeLimit(limit?: number): number {
    if (!limit || limit < 1) {
      return COMMUNITY_DEFAULT_LEADERBOARD_LIMIT
    }

    return Math.min(Math.floor(limit), COMMUNITY_MAX_LEADERBOARD_LIMIT)
  }
}
