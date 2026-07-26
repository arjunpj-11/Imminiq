import { describe, expect, it, vi } from 'vitest';

import { AdminTrackersMapper } from '../../src/modules/admin/trackers/application/admin-trackers.mapper';
import { AddAdminTrackerReviewConsensusUseCase } from '../../src/modules/admin/trackers/application/use-cases/add-admin-tracker-review-consensus.usecase';
import { ResolveAdminTrackerReviewUseCase } from '../../src/modules/admin/trackers/application/use-cases/resolve-admin-tracker-review.usecase';
import type { IAdminTrackerReviewsRepository } from '../../src/modules/admin/trackers/domain/repositories/admin-tracker-reviews.repository.interface';
import { adminTrackerReviewConsensusSchema } from '../../src/modules/admin/trackers/presentation/admin-trackers.schema';

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
      new AddAdminTrackerReviewConsensusUseCase(repository, new AdminTrackersMapper()).execute(
        'review-id',
        'pass',
        actor
      )
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
      new AddAdminTrackerReviewConsensusUseCase(repository, new AdminTrackersMapper()).execute(
        'review-id',
        'fail',
        actor
      )
    ).rejects.toMatchObject({ kind: 'conflict', code: 'TRACKER_REVIEW_NOT_OPEN' });
  });

  it('accepts only pass or fail consensus choices', () => {
    expect(adminTrackerReviewConsensusSchema.parse({ choice: 'fail' })).toEqual({ choice: 'fail' });
    expect(() => adminTrackerReviewConsensusSchema.parse({ choice: 'approve' })).toThrow();
  });

  it('settles voter rewards after an administrator resolves a review', async () => {
    const rewardContext = {
      submissionId: 'review-id',
      consensusChoice: 'pass' as const,
      trackerId: 'tracker-id',
      ownerId: 'owner-id',
      trackerTitle: 'Mathematics',
    };
    const repository = {
      list: vi.fn(),
      addConsensusVote: vi.fn(),
      resolve: vi.fn().mockResolvedValue({
        id: 'review-id',
        status: 'approved',
        rewardContext,
      }),
    } satisfies IAdminTrackerReviewsRepository;
    const rewardService = { settle: vi.fn().mockResolvedValue(undefined) };
    const actor = {
      userId: 'admin-id',
      role: 'admin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
    };

    await expect(
      new ResolveAdminTrackerReviewUseCase(
        repository,
        new AdminTrackersMapper(),
        rewardService
      ).execute('review-id', 'approved', actor)
    ).resolves.toEqual({ id: 'review-id', status: 'approved' });
    expect(rewardService.settle).toHaveBeenCalledWith(rewardContext);
  });
});
