import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'

export class GetHistoryUseCase {
  constructor(private readonly repo: MockTestAnalyticsRepositoryContract) { }

  execute(userId: string) {
    return this.repo.getAttemptHistory(userId)
  }
}
