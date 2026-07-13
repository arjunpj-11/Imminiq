import type { IMockTestAnalyticsRepository } from '../../domain/repositories/mock-test-analytics.repository.interface';
import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import {
  DEFAULT_MOCK_TEST_LIST_LIMIT,
  DEFAULT_MOCK_TEST_PAGE,
  MAX_MOCK_TEST_LIST_LIMIT,
} from '../../domain/mock-tests.constants';
import type { MockTestSummary } from '../../domain/value-objects/mock-test-analytics.vo';
import type { IMockTestAttemptDTO, IMockTestDTO } from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';

type ListMockTestsOptions = {
  page?: number;
  limit?: number;
};

type ListMockTestsRepository = IMockTestRepository &
  IMockTestAttemptRepository &
  IMockTestAnalyticsRepository;

type ListMockTestsResultDTO = {
  summary: MockTestSummary;
  tests: (IMockTestDTO & {
    latestAttempt: IMockTestAttemptDTO | null;
  })[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export interface IListMockTestsUseCase {
  execute(userId: string, options?: ListMockTestsOptions): Promise<ListMockTestsResultDTO>;
}

export class ListMockTestsUseCase implements IListMockTestsUseCase {
  constructor(
    private readonly _repository: ListMockTestsRepository,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(userId: string, options: ListMockTestsOptions = {}) {
    const page = this.sanitizePage(options.page);
    const limit = this.sanitizeLimit(options.limit);

    const [{ tests, total }, summary] = await Promise.all([
      this._repository.findTestsByOwner({
        ownerId: userId,
        page,
        limit,
      }),
      this._repository.getUserSummary(userId),
    ]);

    const latestAttemptMap = await this._repository.findLatestAttemptsForTests({
      userId,
      testIds: tests.map((test) => test._id),
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      summary,
      tests: tests.map((test) => this._mapper.toListItem(test, latestAttemptMap[test._id] || null)),
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private sanitizePage(page?: number): number {
    return Number.isInteger(page) && Number(page) > 0 ? Number(page) : DEFAULT_MOCK_TEST_PAGE;
  }

  private sanitizeLimit(limit?: number): number {
    return Number.isInteger(limit) && Number(limit) > 0 && Number(limit) <= MAX_MOCK_TEST_LIST_LIMIT
      ? Number(limit)
      : DEFAULT_MOCK_TEST_LIST_LIMIT;
  }
}
