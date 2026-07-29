import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { MockTestAttemptSessionDTO } from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';

type RetakeTestRepository = IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestAttemptRepository;

export interface IRetakeTestUseCase {
  execute(attemptId: string, userId: string): Promise<MockTestAttemptSessionDTO>;
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

    const questions = await this._repository.findQuestionsByTest(attempt.testId);
    if (!questions.length) throw MockTestsApplicationError.emptyTest();

    const newAttempt = await this._repository.createAttempt({
      testId: attempt.testId,
      userId,
      totalQuestions: questions.length,
      questionSnapshot: questions.map((question) => ({
        _id: question._id,
        testId: question.testId,
        type: question.type,
        question: question.question,
        options: question.options ? [...question.options] : undefined,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        order: question.order,
        points: question.points,
        coding: question.coding,
        version: question.version,
      })),
    });

    return this._mapper.toAttemptSessionDto(newAttempt, questions, test.timeLimitMinutes);
  }
}
