import { describe, expect, it, vi } from 'vitest';

import { ReportQuestionIssueUseCase } from '../../src/modules/user/mock-tests/application/use-cases/report-question-issue.usecase';
import type { IMockTestsRepository } from '../../src/modules/user/mock-tests/domain/repositories/mock-tests.repository.interface';

const report = {
  reason: 'incorrect_answer' as const,
  details: '  The documented correct option conflicts with the explanation.  ',
};

const repositoryWith = (overrides: Record<string, unknown> = {}) =>
  ({
    findAttemptById: vi.fn().mockResolvedValue({
      _id: 'attempt-id',
      testId: 'test-id',
      userId: 'user-id',
    }),
    findQuestionById: vi.fn().mockResolvedValue({
      _id: 'question-id',
      testId: 'test-id',
    }),
    createOrReopenQuestionIssue: vi.fn().mockResolvedValue({
      id: 'issue-id',
      status: 'open',
      reason: report.reason,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    ...overrides,
  }) as unknown as IMockTestsRepository;

describe('ReportQuestionIssueUseCase', () => {
  it('persists a normalized report tied to the owned attempt and its question', async () => {
    const repository = repositoryWith();

    await expect(
      new ReportQuestionIssueUseCase(repository).execute(
        'attempt-id',
        'question-id',
        'user-id',
        report
      )
    ).resolves.toMatchObject({ id: 'issue-id', status: 'open' });

    expect(repository.createOrReopenQuestionIssue).toHaveBeenCalledWith({
      testId: 'test-id',
      questionId: 'question-id',
      attemptId: 'attempt-id',
      reporterId: 'user-id',
      reason: report.reason,
      details: 'The documented correct option conflicts with the explanation.',
    });
  });

  it('prevents a user from reporting through another user’s attempt', async () => {
    const repository = repositoryWith({
      findAttemptById: vi.fn().mockResolvedValue({
        _id: 'attempt-id',
        testId: 'test-id',
        userId: 'different-user',
      }),
    });

    await expect(
      new ReportQuestionIssueUseCase(repository).execute(
        'attempt-id',
        'question-id',
        'user-id',
        report
      )
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    expect(repository.createOrReopenQuestionIssue).not.toHaveBeenCalled();
  });

  it('rejects a question that does not belong to the attempt test', async () => {
    const repository = repositoryWith({
      findQuestionById: vi.fn().mockResolvedValue({
        _id: 'question-id',
        testId: 'another-test',
      }),
    });

    await expect(
      new ReportQuestionIssueUseCase(repository).execute(
        'attempt-id',
        'question-id',
        'user-id',
        report
      )
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    expect(repository.createOrReopenQuestionIssue).not.toHaveBeenCalled();
  });
});
