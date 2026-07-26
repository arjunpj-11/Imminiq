import { describe, expect, it, vi } from 'vitest';

import { GetAttemptQuestionsUseCase } from '../../src/modules/user/mock-tests/application/use-cases/get-attempt-questions.usecase';

describe('GetAttemptQuestionsUseCase', () => {
  it('rejects an unknown attempt instead of returning an empty, usable test', async () => {
    const repository = {
      findAttemptById: vi.fn().mockResolvedValue(null),
      findQuestionsByTest: vi.fn(),
    };
    const mapper = {
      sanitizeQuestionForAttempt: vi.fn(),
    };
    const questionSnapshot = {
      all: vi.fn(),
    };
    const useCase = new GetAttemptQuestionsUseCase(
      repository as never,
      mapper as never,
      questionSnapshot as never
    );

    await expect(useCase.execute('missing-attempt', 'user-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Attempt not found',
    });
    expect(repository.findQuestionsByTest).not.toHaveBeenCalled();
  });
});
