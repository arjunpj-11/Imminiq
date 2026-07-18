import type { IMockTestAnalyticsRepository } from '../../domain/repositories/mock-test-analytics.repository.interface';
import type { IMockTestsMapper } from '../mock-tests.mapper';
import type { TopicBreakdownItemDTO } from '../mock-tests.dto';

export interface IGetTopicBreakdownUseCase {
  execute(userId: string): Promise<TopicBreakdownItemDTO[]>;
}

export class GetTopicBreakdownUseCase implements IGetTopicBreakdownUseCase {
  constructor(
    private readonly _repository: IMockTestAnalyticsRepository,
    private readonly _mapper: IMockTestsMapper
  ) {}

  execute(userId: string) {
    return this._repository
      .getTopicBreakdown(userId)
      .then((items) => items.map((item) => this._mapper.toTopicBreakdownDto(item)));
  }
}
