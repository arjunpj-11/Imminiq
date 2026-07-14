import { describe, expect, it, vi } from 'vitest';

import { AdminTrackerReviewsUseCase } from '../../src/modules/admin/tracker-reviews/application/use-cases/admin-tracker-reviews.usecase';
import type { IAdminTrackerReviewsRepository } from '../../src/modules/admin/tracker-reviews/domain/repositories/admin-tracker-reviews.repository.interface';
import { adminTrackerReviewConsensusSchema } from '../../src/modules/admin/tracker-reviews/presentation/admin-tracker-reviews.schema';

describe('AdminTrackerReviewsUseCase', () => {
  it('records the selected administrator consensus vote', async () => {
    const repository = {
      list: vi.fn(),
      resolve: vi.fn(),
      addConsensusVote: vi.fn().mockResolvedValue({
        id: 'review-id',
        passVotes: 4,
        failVotes: 2,
      }),
    } satisfies IAdminTrackerReviewsRepository;
    const actor = {
      userId: 'admin-id',
      role: 'admin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
    };

    await expect(
      new AdminTrackerReviewsUseCase(repository).addConsensusVote('review-id', 'pass', actor)
    ).resolves.toEqual({ id: 'review-id', passVotes: 4, failVotes: 2 });
    expect(repository.addConsensusVote).toHaveBeenCalledWith('review-id', 'pass', actor);
  });

  it('accepts only pass or fail consensus choices', () => {
    expect(adminTrackerReviewConsensusSchema.parse({ choice: 'fail' })).toEqual({ choice: 'fail' });
    expect(() => adminTrackerReviewConsensusSchema.parse({ choice: 'approve' })).toThrow();
  });
});
