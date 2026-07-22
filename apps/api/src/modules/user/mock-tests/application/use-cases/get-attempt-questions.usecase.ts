import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { PublicMockTestQuestionDTO } from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';
import type { IAttemptQuestionSnapshotService } from '../services/attempt-question-snapshot.service';

type GetAttemptQuestionsRepository = IMockTestAttemptRepository & IMockTestQuestionRepository;

export interface IGetAttemptQuestionsUseCase {
  execute(attemptId: string, userId: string): Promise<PublicMockTestQuestionDTO[]>;
}

export class GetAttemptQuestionsUseCase implements IGetAttemptQuestionsUseCase {
  constructor(
    private readonly _repository: GetAttemptQuestionsRepository,
    private readonly _mapper: IMockTestsMapper,
    private readonly _questionSnapshot: IAttemptQuestionSnapshotService
  ) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this._repository.findAttemptById(attemptId);

    if (!attempt || attempt.userId !== userId) {
      return [];
    }

    const questions = await this._repository.findQuestionsByTest(attempt.testId);

    return this._questionSnapshot
      .all(attempt, questions)
      .map((question) => this._mapper.sanitizeQuestionForAttempt(question));
  }
}
