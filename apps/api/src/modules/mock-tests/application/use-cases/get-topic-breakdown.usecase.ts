import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'

export class GetTopicBreakdownUseCase {
  constructor(private readonly _repo: MockTestAnalyticsRepositoryContract) { }

  execute(userId: string) {
    return this._repo.getTopicBreakdown(userId)
  }
}
