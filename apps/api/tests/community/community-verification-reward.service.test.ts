import { describe, expect, it, vi } from 'vitest';

import { CommunityVerificationRewardService } from '../../src/modules/user/community/application/services/community-verification-reward.service';

describe('CommunityVerificationRewardService', () => {
  it('awards every unrewarded majority voter and marks each payout', async () => {
    const repository = {
      findUnrewardedMajorityVotes: vi.fn().mockResolvedValue([
        { id: 'vote-1', userId: 'user-1' },
        { id: 'vote-2', userId: 'user-2' },
      ]),
      markVerificationVoteRewarded: vi.fn().mockResolvedValue(true),
    };
    const activity = {
      recordTrackerCloned: vi.fn(),
      recordVerificationVoteSubmitted: vi.fn(),
      recordVerificationMajorityWon: vi.fn().mockResolvedValue(undefined),
      recordTrackerVerified: vi.fn().mockResolvedValue(undefined),
    };
    const policyReader = {
      getCommunityPolicy: vi.fn().mockResolvedValue({
        verificationRequiredVotes: 10,
        verificationDurationHours: 24,
        voteTeacherXp: 30,
        majorityTeacherXp: 100,
        reviewRewardCoins: 50,
      }),
    };
    const service = new CommunityVerificationRewardService(repository, activity, policyReader);

    await service.settle({
      submissionId: 'submission-1',
      consensusChoice: 'pass',
      trackerId: 'tracker-1',
      ownerId: 'owner-1',
      trackerTitle: 'Mathematics',
    });

    expect(activity.recordTrackerVerified).toHaveBeenCalledOnce();
    expect(activity.recordVerificationMajorityWon).toHaveBeenCalledTimes(2);
    expect(activity.recordVerificationMajorityWon).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        voteId: 'vote-1',
        coinsAwarded: 50,
      })
    );
    expect(repository.markVerificationVoteRewarded).toHaveBeenNthCalledWith(1, 'vote-1', 50);
    expect(repository.markVerificationVoteRewarded).toHaveBeenNthCalledWith(2, 'vote-2', 50);
  });

  it('does nothing while consensus is unresolved', async () => {
    const repository = {
      findUnrewardedMajorityVotes: vi.fn(),
      markVerificationVoteRewarded: vi.fn(),
    };
    const activity = {
      recordTrackerCloned: vi.fn(),
      recordVerificationVoteSubmitted: vi.fn(),
      recordVerificationMajorityWon: vi.fn(),
      recordTrackerVerified: vi.fn(),
    };
    const service = new CommunityVerificationRewardService(repository, activity, {
      getCommunityPolicy: vi.fn(),
    });

    await service.settle({
      submissionId: 'submission-1',
      consensusChoice: null,
      trackerId: 'tracker-1',
      ownerId: 'owner-1',
      trackerTitle: 'Mathematics',
    });

    expect(repository.findUnrewardedMajorityVotes).not.toHaveBeenCalled();
    expect(activity.recordVerificationMajorityWon).not.toHaveBeenCalled();
  });
});
