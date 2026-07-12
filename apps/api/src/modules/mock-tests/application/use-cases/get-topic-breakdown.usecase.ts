import type { IMockTestAnalyticsRepository } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { IMockTestsMapper } from '../mappers/mock-tests.mapper'

export class GetTopicBreakdownUseCase {
  constructor(
    private readonly _repository: IMockTestAnalyticsRepository,
    private readonly _mapper: IMockTestsMapper,
  ) { }

  execute(userId: string) {
    return this._repository.getTopicBreakdown(userId).then((items) =>
      items.map((item) => this._mapper.toTopicBreakdownDto(item)))
  }
}
