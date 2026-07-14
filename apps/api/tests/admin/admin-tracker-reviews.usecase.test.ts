import { describe, expect, it, vi } from 'vitest';

import { AddAdminTrackerReviewConsensusUseCase } from '../../src/modules/admin/tracker-reviews/application/use-cases/add-admin-tracker-review-consensus.usecase';
import type { IAdminTrackerReviewsRepository } from '../../src/modules/admin/tracker-reviews/domain/repositories/admin-tracker-reviews.repository.interface';
import { adminTrackerReviewConsensusSchema } from '../../src/modules/admin/tracker-reviews/presentation/admin-tracker-reviews.schema';
import { AdminTrackerReviewsMapper } from '../../src/modules/admin/tracker-reviews/application/admin-tracker-reviews.mapper';

describe('AdminTrackerReviewsUseCase', () => {
  it('records the selected administrator consensus vote', async () => {
    const repository = {
      list: vi.fn(),
      resolve: vi.fn(),
      addConsensusVote: vi.fn().mockResolvedValue({
        kind: 'success',
        value: { id: 'review-id', passVotes: 4, failVotes: 2 },
      }),
    } satisfies IAdminTrackerReviewsRepository;
    const actor = {
      userId: 'admin-id',
      role: 'admin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
    };

    await expect(
      new AddAdminTrackerReviewConsensusUseCase(
        repository,
        new AdminTrackerReviewsMapper()
      ).execute('review-id', 'pass', actor)
    ).resolves.toEqual({ id: 'review-id', passVotes: 4, failVotes: 2 });
    expect(repository.addConsensusVote).toHaveBeenCalledWith('review-id', 'pass', actor);
  });

  it('maps closed reviews to a safe conflict error', async () => {
    const repository = {
      list: vi.fn(),
      resolve: vi.fn(),
      addConsensusVote: vi.fn().mockResolvedValue({ kind: 'not_open' }),
    } satisfies IAdminTrackerReviewsRepository;
    const actor = {
      userId: 'admin-id',
      role: 'admin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
    };

    await expect(
      new AddAdminTrackerReviewConsensusUseCase(
        repository,
        new AdminTrackerReviewsMapper()
      ).execute('review-id', 'fail', actor)
    ).rejects.toMatchObject({ statusCode: 409, code: 'TRACKER_REVIEW_NOT_OPEN' });
  });

  it('accepts only pass or fail consensus choices', () => {
    expect(adminTrackerReviewConsensusSchema.parse({ choice: 'fail' })).toEqual({ choice: 'fail' });
    expect(() => adminTrackerReviewConsensusSchema.parse({ choice: 'approve' })).toThrow();
  });
});
