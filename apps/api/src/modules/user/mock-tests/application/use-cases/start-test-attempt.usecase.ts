import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { MockTestAttemptSessionDTO } from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';
import { attemptQuestionSnapshotService } from '../services/attempt-question-snapshot.service';

type StartTestAttemptRepository = IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestAttemptRepository;

export interface IStartTestAttemptUseCase {
  execute(testId: string, userId: string): Promise<MockTestAttemptSessionDTO>;
}

export class StartTestAttemptUseCase implements IStartTestAttemptUseCase {
  constructor(
    private readonly _repository: StartTestAttemptRepository,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(testId: string, userId: string) {
    const test = await this._repository.findTestById(testId);

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found');
    }

    if (test.moderationStatus !== 'active') {
      throw MockTestsApplicationError.forbidden('This mock test is unavailable after an administrative review.');
    }

    if (test.visibility === 'private' && test.ownerId !== userId) {
      throw MockTestsApplicationError.forbidden();
    }

    const existingAttempt = await this._repository.findActiveAttempt({
      userId,
      testId,
    });

    const questions = await this._repository.findQuestionsByTest(testId);

    if (!questions.length && !existingAttempt?.questionSnapshot.length) {
      throw MockTestsApplicationError.emptyTest();
    }

    if (existingAttempt) {
      return this._mapper.toAttemptSessionDto(
        existingAttempt,
        attemptQuestionSnapshotService.all(existingAttempt, questions)
      );
    }

    const attempt = await this._repository.createAttempt({
      testId,
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

    return this._mapper.toAttemptSessionDto(attempt, questions);
  }
}
