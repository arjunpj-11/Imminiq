import type { IMockTestAnswerRepository } from '../../domain/repositories/mock-test-answer.repository.interface';
import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { FlagQuestionResultDTO } from '../mock-tests.dto';

type FlagQuestionRepository = IMockTestAttemptRepository & IMockTestAnswerRepository;

export interface IFlagQuestionUseCase {
  execute(attemptId: string, userId: string, questionId: string): Promise<FlagQuestionResultDTO>;
}

export class FlagQuestionUseCase implements IFlagQuestionUseCase {
  constructor(private readonly _repository: FlagQuestionRepository) {}

  async execute(attemptId: string, userId: string, questionId: string) {
    const attempt = await this._repository.findAttemptById(attemptId);

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden();
    }

    if (attempt.status !== 'in_progress') {
      throw MockTestsApplicationError.testNotActive();
    }

    if (attempt.flaggedQuestions.includes(questionId)) {
      await this._repository.unflagQuestion({
        attemptId,
        questionId,
      });

      return { flagged: false };
    }

    await this._repository.flagQuestion({
      attemptId,
      questionId,
    });

    return { flagged: true };
  }
}
