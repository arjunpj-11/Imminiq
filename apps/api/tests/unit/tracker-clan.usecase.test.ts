import { describe, expect, it, vi } from 'vitest';

import { TrackerClanUseCase } from '../../src/modules/user/trackers/application/use-cases/tracker-clan.usecase';
import { TrackerClanChallengeUseCase } from '../../src/modules/user/trackers/application/use-cases/tracker-clan-challenge.usecase';
import type {
  ITrackerClanChallengeNotifier,
  ITrackerClanChallengeRepository,
  ITrackerClanRepository,
  TrackerClanChallenge,
} from '../../src/modules/user/trackers/domain';

const repository = () =>
  ({
    getOverview: vi.fn(),
    getRole: vi.fn(),
    requestJoin: vi.fn(),
    reviewJoin: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
    leaveClan: vi.fn(),
    transferOwnership: vi.fn(),
    updateTopic: vi.fn(),
    deleteTopic: vi.fn(),
    deleteSubtopic: vi.fn(),
    listMessages: vi.fn(),
    listChallenges: vi.fn(),
    createChallenge: vi.fn(),
    acceptChallenge: vi.fn(),
    declineChallenge: vi.fn(),
    cancelChallenge: vi.fn(),
    submitChallenge: vi.fn(),
  }) as unknown as ITrackerClanRepository & ITrackerClanChallengeRepository;

describe('TrackerClanUseCase', () => {
  it('joins a public guild immediately using the repository result', async () => {
    const clans = repository();
    vi.mocked(clans.requestJoin).mockResolvedValue({
      trackerId: 'tracker-1',
      trackerTitle: 'MERN Stack',
      trackerDescription: '',
      topicsCount: 8,
      subtopicsCount: 24,
      visibility: 'public',
      role: 'member',
      canManage: false,
      canTransferOwnership: false,
      hasPendingJoinRequest: false,
      members: [],
      joinRequests: [],
    });
    const useCase = new TrackerClanUseCase(clans);
    await expect(
      useCase.requestJoin({ trackerId: 'tracker-1', userId: 'member-1' })
    ).resolves.toMatchObject({ role: 'member', trackerTitle: 'MERN Stack' });
  });

  it('rejects unauthorized role changes', async () => {
    const clans = repository();
    vi.mocked(clans.updateMemberRole).mockResolvedValue(null);
    const useCase = new TrackerClanUseCase(clans);
    await expect(
      useCase.updateMemberRole({
        trackerId: 'tracker-1',
        userId: 'member-1',
        memberId: 'member-2',
        role: 'co_owner',
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('allows only guild members to load chat history', async () => {
    const clans = repository();
    vi.mocked(clans.listMessages).mockResolvedValue(null);
    const useCase = new TrackerClanUseCase(clans);
    await expect(
      useCase.listMessages({ trackerId: 'tracker-1', userId: 'outsider' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('requires the owner to transfer ownership before leaving', async () => {
    const clans = repository();
    vi.mocked(clans.getRole).mockResolvedValue('owner');
    const useCase = new TrackerClanUseCase(clans);

    await expect(
      useCase.leaveClan({ trackerId: 'tracker-1', userId: 'owner-1' })
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'Transfer ownership to another guild member before leaving',
    });
    expect(clans.leaveClan).not.toHaveBeenCalled();
  });

  it('announces a created challenge to realtime guild listeners', async () => {
    const clans = repository();
    const challenge = {
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'open',
      challenger: { userId: 'member-1' },
      opponent: null,
    } as TrackerClanChallenge;
    vi.mocked(clans.createChallenge).mockResolvedValue(challenge);
    const notifier: ITrackerClanChallengeNotifier = { notify: vi.fn() };
    const useCase = new TrackerClanChallengeUseCase(clans, notifier);

    await expect(
      useCase.create({
        trackerId: 'tracker-1',
        userId: 'member-1',
        durationMinutes: 10,
        questionCount: 5,
      })
    ).resolves.toBe(challenge);
    expect(notifier.notify).toHaveBeenCalledWith({
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'open',
      challengerId: 'member-1',
      opponentId: null,
    });
  });
});
