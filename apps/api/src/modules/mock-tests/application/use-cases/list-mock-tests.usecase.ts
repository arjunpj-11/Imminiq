import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'

export class ListMockTestsUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(userId: string) {
    const [tests, summary] = await Promise.all([
      this.repo.findTestsByOwner(userId),
      this.repo.getUserSummary(userId),
    ])
    const latestAttemptMap = await this.repo.findLatestAttemptsForTests(userId, tests.map((t) => t._id))
    return { summary, tests: tests.map((test) => ({ ...test, latestAttempt: latestAttemptMap[test._id] || null })) }
  }
}
