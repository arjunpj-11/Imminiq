export type MockTestQuestionIssueReason =
  | 'incorrect_answer'
  | 'ambiguous_question'
  | 'duplicate_question'
  | 'broken_code_or_test_case'
  | 'formatting_problem'
  | 'unsafe_or_offensive'
  | 'other';

export type CreateMockTestQuestionIssueInput = {
  testId: string;
  questionId: string;
  attemptId: string;
  reporterId: string;
  reason: MockTestQuestionIssueReason;
  details: string;
};

export type MockTestQuestionIssueResult = {
  id: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reason: MockTestQuestionIssueReason;
  createdAt: Date;
  updatedAt: Date;
};

export interface IMockTestQuestionIssueRepository {
  createOrReopenQuestionIssue(
    input: CreateMockTestQuestionIssueInput
  ): Promise<MockTestQuestionIssueResult>;
}
