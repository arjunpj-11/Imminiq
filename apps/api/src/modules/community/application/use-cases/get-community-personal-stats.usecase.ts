import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityStatCardView } from '../dtos/community.dto'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class GetCommunityPersonalStatsUseCase {
  constructor(
    private readonly _repository: CommunityRepositoryContract,
    private readonly _mapper: CommunityMapperContract,
  ) {}

  async execute(userId: string): Promise<CommunityStatCardView[]> {
    const stats = await this._repository.getPersonalStats(userId)

    return this._mapper.toStatCards(stats)
  }
}
