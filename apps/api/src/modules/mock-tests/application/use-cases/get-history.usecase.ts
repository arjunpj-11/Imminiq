import type { IMockTestAnalyticsRepository } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { IMockTestsMapper } from '../mappers/mock-tests.mapper'

export interface IGetHistoryUseCase {
  execute(userId: string): Promise<import("..").IMockTestAttemptHistoryDTO[]>
}

export class GetHistoryUseCase implements IGetHistoryUseCase {
  constructor(
    private readonly _repository: IMockTestAnalyticsRepository,
    private readonly _mapper: IMockTestsMapper,
  ) { }

  execute(userId: string) {
    return this._repository.getAttemptHistory(userId).then((items) =>
      items.map((item) => this._mapper.toAttemptHistoryDto(item)))
  }
}
