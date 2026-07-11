import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

export class GetTopicBreakdownUseCase {
  constructor(
    private readonly _repo: MockTestAnalyticsRepositoryContract,
    private readonly _mapper: MockTestsMapperContract,
  ) { }

  execute(userId: string) {
    return this._repo.getTopicBreakdown(userId).then((items) =>
      items.map((item) => this._mapper.toTopicBreakdownDto(item)))
  }
}
