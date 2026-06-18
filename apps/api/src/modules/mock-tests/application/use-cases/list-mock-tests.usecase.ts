import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'
import {
  DEFAULT_MOCK_TEST_LIST_LIMIT,
  DEFAULT_MOCK_TEST_PAGE,
  MAX_MOCK_TEST_LIST_LIMIT,
} from '../../domain/constants/mock-tests.constants'

type ListMockTestsOptions = {
  page?: number
  limit?: number
}

type ListMockTestsRepository =
  MockTestRepositoryContract &
  MockTestAttemptRepositoryContract &
  MockTestAnalyticsRepositoryContract

export class ListMockTestsUseCase {
  constructor(
    private readonly repo: ListMockTestsRepository,
    private readonly mapper: MockTestsMapperContract,
  ) { }

  async execute(userId: string, options: ListMockTestsOptions = {}) {
    const page = this.sanitizePage(options.page)
    const limit = this.sanitizeLimit(options.limit)

    const [{ tests, total }, summary] = await Promise.all([
      this.repo.findTestsByOwner(userId, { page, limit }),
      this.repo.getUserSummary(userId),
    ])

    const latestAttemptMap = await this.repo.findLatestAttemptsForTests(
      userId,
      tests.map((test) => test._id),
    )

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      summary,
      tests: tests.map((test) =>
        this.mapper.toListItem(test, latestAttemptMap[test._id] || null),
      ),
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  private sanitizePage(page?: number): number {
    return Number.isInteger(page) && Number(page) > 0
      ? Number(page)
      : DEFAULT_MOCK_TEST_PAGE
  }

  private sanitizeLimit(limit?: number): number {
    return Number.isInteger(limit) && Number(limit) > 0 && Number(limit) <= MAX_MOCK_TEST_LIST_LIMIT
      ? Number(limit)
      : DEFAULT_MOCK_TEST_LIST_LIMIT
  }
}
