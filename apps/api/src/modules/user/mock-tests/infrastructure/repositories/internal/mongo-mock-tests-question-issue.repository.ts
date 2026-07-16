import { MockTestQuestionIssueModel } from '../../../../../../infrastructure/database/models/mock-test-question-issue.model';
import type {
  CreateMockTestQuestionIssueInput,
  IMockTestQuestionIssueRepository,
} from '../../../domain/repositories/mock-test-question-issue.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';

export class MongoMockTestsQuestionIssueRepository
  extends MongoMockTestsBaseRepository
  implements IMockTestQuestionIssueRepository
{
  async createOrReopenQuestionIssue(input: CreateMockTestQuestionIssueInput) {
    return this.execute(
      'MOCK_TEST_QUESTION_ISSUE_WRITE_FAILED',
      'Failed to report mock test question',
      async () => {
        const now = new Date();
        const issue = await MockTestQuestionIssueModel.findOneAndUpdate(
          {
            reporterId: input.reporterId,
            attemptId: input.attemptId,
            questionId: input.questionId,
          },
          {
            $set: {
              testId: input.testId,
              reason: input.reason,
              details: input.details,
              status: 'open',
              assignedTo: null,
              resolutionAction: 'none',
              resolutionNote: '',
              resolvedBy: null,
              resolvedAt: null,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        ).lean();

        return {
          id: String(issue!._id),
          status: issue!.status as 'open' | 'reviewing' | 'resolved' | 'dismissed',
          reason: issue!.reason as CreateMockTestQuestionIssueInput['reason'],
          createdAt: issue!.createdAt,
          updatedAt: issue!.updatedAt,
        };
      }
    );
  }
}
