import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'
import type { ICommunityStatCardViewDTO } from '../dtos/community.dto'
import type { ICommunityMapper } from '../mappers/community.mapper'

export interface IGetCommunityPersonalStatsUseCase {
  execute(userId: string): Promise<ICommunityStatCardViewDTO[]>
}

export class GetCommunityPersonalStatsUseCase implements IGetCommunityPersonalStatsUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper,
  ) {}

  async execute(userId: string): Promise<ICommunityStatCardViewDTO[]> {
    const stats = await this._repository.getPersonalStats(userId)

    return this._mapper.toStatCards(stats)
  }
}
