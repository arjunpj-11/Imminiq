import mongoose, { Schema } from 'mongoose';

export const MOCK_TEST_QUESTION_ISSUE_REASONS = [
  'incorrect_answer',
  'ambiguous_question',
  'duplicate_question',
  'broken_code_or_test_case',
  'formatting_problem',
  'unsafe_or_offensive',
  'other',
] as const;

export const MOCK_TEST_QUESTION_ISSUE_STATUSES = [
  'open',
  'reviewing',
  'resolved',
  'dismissed',
] as const;

const mockTestQuestionIssueSchema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestQuestion',
      required: true,
      index: true,
    },
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestAttempt',
      required: true,
      index: true,
    },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, enum: MOCK_TEST_QUESTION_ISSUE_REASONS, required: true, index: true },
    details: { type: String, default: '', trim: true, maxlength: 1500 },
    status: {
      type: String,
      enum: MOCK_TEST_QUESTION_ISSUE_STATUSES,
      default: 'open',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    resolutionAction: {
      type: String,
      enum: ['none', 'question_corrected', 'question_disabled', 'test_suspended', 'test_deleted'],
      default: 'none',
    },
    resolutionNote: { type: String, default: '', trim: true, maxlength: 1500 },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

mockTestQuestionIssueSchema.index({ reporterId: 1, attemptId: 1, questionId: 1 }, { unique: true });
mockTestQuestionIssueSchema.index({ status: 1, createdAt: 1 });
mockTestQuestionIssueSchema.index({ questionId: 1, status: 1 });

export const MockTestQuestionIssueModel =
  mongoose.models.MockTestQuestionIssue ||
  mongoose.model('MockTestQuestionIssue', mockTestQuestionIssueSchema);
