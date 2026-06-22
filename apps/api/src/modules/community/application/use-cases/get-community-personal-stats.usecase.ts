import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityStatCardView } from '../dtos/community.dto'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class GetCommunityPersonalStatsUseCase {
  constructor(
    private readonly repository: CommunityRepositoryContract,
    private readonly mapper: CommunityMapperContract,
  ) {}

  async execute(userId: string): Promise<CommunityStatCardView[]> {
    const stats = await this.repository.getPersonalStats(userId)

    return this.mapper.toStatCards(stats)
  }
}
