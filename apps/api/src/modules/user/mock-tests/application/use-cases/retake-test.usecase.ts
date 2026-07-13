import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { IMockTestAttemptSessionDTO } from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';

type RetakeTestRepository = IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestAttemptRepository;

export interface IRetakeTestUseCase {
  execute(attemptId: string, userId: string): Promise<IMockTestAttemptSessionDTO>;
}

export class RetakeTestUseCase implements IRetakeTestUseCase {
  constructor(
    private readonly _repository: RetakeTestRepository,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this._repository.findAttemptById(attemptId);

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden();
    }

    const test = await this._repository.findTestById(attempt.testId);

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found');
    }

    await this._repository.abandonActiveAttempts({
      userId,
      testId: attempt.testId,
    });

    const newAttempt = await this._repository.createAttempt({
      testId: attempt.testId,
      userId,
      totalQuestions: test.questionCount,
    });

    const questions = await this._repository.findQuestionsByTest(attempt.testId);

    return this._mapper.toAttemptSessionDto(newAttempt, questions);
  }
}
