import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'

type ListMockTestsOptions = {
  page?: number
  limit?: number
}

const sanitizePage = (page?: number): number =>
  Number.isInteger(page) && Number(page) > 0 ? Number(page) : 1

const sanitizeLimit = (limit?: number): number =>
  Number.isInteger(limit) && Number(limit) > 0 && Number(limit) <= 50
    ? Number(limit)
    : 6

export class ListMockTestsUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(userId: string, options: ListMockTestsOptions = {}) {
    const page = sanitizePage(options.page)
    const limit = sanitizeLimit(options.limit)

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

      tests: tests.map((test) => ({
        ...test,
        latestAttempt: latestAttemptMap[test._id] || null,
      })),

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
}