import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { MockTestDetailsDTO } from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';

type GetMockTestDetailsRepository = IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestAttemptRepository;

export interface IGetMockTestDetailsUseCase {
  execute(testId: string, userId: string): Promise<MockTestDetailsDTO>;
}

export class GetMockTestDetailsUseCase implements IGetMockTestDetailsUseCase {
  constructor(
    private readonly _repository: GetMockTestDetailsRepository,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(testId: string, userId: string) {
    const test =
      (await this._repository.findTestById(testId)) ??
      (await this._repository.findTestForModerationDisplayById(testId));

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found');
    }

    const attempts = await this._repository.findAttemptsByUser({
      userId,
      testId,
    });

    if (test.ownerId !== userId && attempts.length === 0) {
      throw MockTestsApplicationError.forbidden();
    }

    const questions = await this._repository.findQuestionsByTest(testId);

    const ownsTest = test.ownerId === userId;

    return this._mapper.toDetailsDto({
      test,
      questions,
      latestAttempt: attempts[0] || null,
      includeAnswers: ownsTest,
    });
  }
}
