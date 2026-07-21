import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestQuestionIssueRepository } from '../../domain/repositories/mock-test-question-issue.repository.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { ReportQuestionIssueInputDTO, ReportQuestionIssueResultDTO } from '../mock-tests.dto';

export interface IReportQuestionIssueUseCase {
  execute(
    attemptId: string,
    questionId: string,
    userId: string,
    input: ReportQuestionIssueInputDTO
  ): Promise<ReportQuestionIssueResultDTO>;
}

type ReportQuestionIssueRepository = Pick<IMockTestAttemptRepository, 'findAttemptById'> &
  Pick<IMockTestQuestionRepository, 'findQuestionById'> &
  Pick<IMockTestQuestionIssueRepository, 'createOrReopenQuestionIssue'>;

export class ReportQuestionIssueUseCase implements IReportQuestionIssueUseCase {
  constructor(private readonly _repository: ReportQuestionIssueRepository) {}

  async execute(
    attemptId: string,
    questionId: string,
    userId: string,
    input: ReportQuestionIssueInputDTO
  ) {
    const [attempt, question] = await Promise.all([
      this._repository.findAttemptById(attemptId),
      this._repository.findQuestionById(questionId),
    ]);

    if (!attempt) throw MockTestsApplicationError.notFound('Attempt not found');
    if (attempt.userId !== userId) throw MockTestsApplicationError.forbidden();
    if (!question || question.testId !== attempt.testId) {
      throw MockTestsApplicationError.notFound('Question not found in this attempt');
    }

    return this._repository.createOrReopenQuestionIssue({
      testId: attempt.testId,
      questionId,
      attemptId,
      reporterId: userId,
      reason: input.reason,
      details: input.details?.trim() ?? '',
    });
  }
}
