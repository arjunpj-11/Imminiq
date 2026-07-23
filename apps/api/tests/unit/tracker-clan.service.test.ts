import { describe, expect, it, vi } from 'vitest';

import { TrackerClanService } from '../../src/modules/user/trackers/application/services/tracker-clan.service';
import { TrackerClanNotificationService } from '../../src/modules/user/trackers/application/services/tracker-clan-notification.service';
import { TrackerClanChallengeService } from '../../src/modules/user/trackers/application/services/tracker-clan-challenge.service';
import type {
  ITrackerClanChallengeNotifier,
  ITrackerClanNotificationNotifier,
  ITrackerClanChallengeQuestionGenerator,
  ITrackerClanChallengeRepository,
  ITrackerClanRepository,
  TrackerClanChallenge,
  TrackerClanOverview,
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
    respondToRoleInvitation: vi.fn(),
    syncPersonalClone: vi.fn(),
    updateTopic: vi.fn(),
    deleteTopic: vi.fn(),
    deleteSubtopic: vi.fn(),
    listMessages: vi.fn(),
    listChallenges: vi.fn(),
    getChallenge: vi.fn(),
    getChallengeHistory: vi.fn(),
    getActiveChallenge: vi.fn(),
    canCreateChallenge: vi.fn().mockResolvedValue(true),
    getChallengeQuestionContext: vi.fn(),
    createChallenge: vi.fn(),
    acceptChallenge: vi.fn(),
    declineChallenge: vi.fn(),
    cancelChallenge: vi.fn(),
    quitChallenge: vi.fn(),
    getChallengeExtensionContext: vi.fn(),
    appendChallengeQuestions: vi.fn(),
    submitChallenge: vi.fn(),
    chooseChallengeCheckpoint: vi.fn(),
    answerChallengeNode: vi.fn(),
    useChallengePower: vi.fn(),
  }) as unknown as ITrackerClanRepository & ITrackerClanChallengeRepository;

describe('TrackerClanService', () => {
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
      personalCloneTrackerId: 'clone-1',
      members: [],
      joinRequests: [],
      roleInvitations: [],
    });
    const useCase = new TrackerClanService(clans);
    await expect(
      useCase.requestJoin({ trackerId: 'tracker-1', userId: 'member-1' })
    ).resolves.toMatchObject({ role: 'member', trackerTitle: 'MERN Stack' });
  });

  it('rejects unauthorized role changes', async () => {
    const clans = repository();
    vi.mocked(clans.updateMemberRole).mockResolvedValue(null);
    const useCase = new TrackerClanService(clans);
    await expect(
      useCase.updateMemberRole({
        trackerId: 'tracker-1',
        userId: 'member-1',
        memberId: 'member-2',
        role: 'co_owner',
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('notifies a member when a co-owner invitation is created', async () => {
    const clans = repository();
    const invitation = {
      id: 'invitation-1',
      userId: 'member-2',
      role: 'co_owner' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      invitedBy: { userId: 'owner-1', name: 'Owner', username: 'owner' },
    };
    vi.mocked(clans.updateMemberRole).mockResolvedValue({
      trackerId: 'tracker-1',
      trackerTitle: 'MERN Stack',
      trackerDescription: '',
      topicsCount: 8,
      subtopicsCount: 24,
      visibility: 'public',
      role: 'owner',
      canManage: true,
      canTransferOwnership: true,
      hasPendingJoinRequest: false,
      personalCloneTrackerId: 'clone-1',
      members: [],
      joinRequests: [],
      roleInvitations: [invitation],
    } satisfies TrackerClanOverview);
    const notifications: ITrackerClanNotificationNotifier = { notify: vi.fn() };
    const useCase = new TrackerClanService(
      clans,
      new TrackerClanNotificationService(notifications)
    );

    await useCase.updateMemberRole({
      trackerId: 'tracker-1',
      userId: 'owner-1',
      memberId: 'member-2',
      role: 'co_owner',
    });

    expect(notifications.notify).toHaveBeenCalledWith({
      userId: 'member-2',
      type: 'tracker_clan_role_invitation',
      message: 'You were invited to become a co-owner of “MERN Stack”.',
      deepLink: '/trackers/tracker-1/clan',
      eventId: 'invitation-1',
      metadata: {
        trackerId: 'tracker-1',
        invitationId: 'invitation-1',
        role: 'co_owner',
      },
    });
  });

  it('allows only guild members to load chat history', async () => {
    const clans = repository();
    vi.mocked(clans.listMessages).mockResolvedValue(null);
    const useCase = new TrackerClanService(clans);
    await expect(
      useCase.listMessages({ trackerId: 'tracker-1', userId: 'outsider' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('requires the owner to transfer ownership before leaving', async () => {
    const clans = repository();
    vi.mocked(clans.getRole).mockResolvedValue('owner');
    const useCase = new TrackerClanService(clans);

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
    const context = {
      trackerTitle: 'JEE Mathematics',
      trackerDescription: 'Prepare for JEE Main and Advanced mathematics',
      category: 'Exam preparation',
      field: 'Mathematics',
      goal: 'Score well in JEE',
      level: 'advanced' as const,
      contentLanguage: 'English',
      topics: [
        {
          title: 'Calculus',
          description: 'Limits and derivatives',
          subtopics: [{ title: 'Differentiation', description: 'Derivative applications' }],
        },
      ],
    };
    const questions = [
      {
        prompt: 'If f(x) = x², what is f′(3)?',
        options: ['3', '6', '9', '12'],
        correctAnswer: '6',
        topicTitle: 'Calculus',
        points: 1,
        isCheckpoint: true,
      },
    ];
    vi.mocked(clans.getChallengeQuestionContext).mockResolvedValue(context);
    const challenge = {
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'pending',
      challenger: { userId: 'member-1', name: 'Ada', username: 'ada' },
      opponent: { userId: 'member-2', name: 'Lin', username: 'lin' },
    } as TrackerClanChallenge;
    vi.mocked(clans.createChallenge).mockResolvedValue(challenge);
    const questionGenerator: ITrackerClanChallengeQuestionGenerator = { generate: vi.fn() };
    vi.mocked(questionGenerator.generate).mockResolvedValue(questions);
    const notifier: ITrackerClanChallengeNotifier = { notify: vi.fn() };
    const notifications: ITrackerClanNotificationNotifier = { notify: vi.fn() };
    const useCase = new TrackerClanChallengeService(
      clans,
      questionGenerator,
      notifier,
      notifications
    );

    await expect(
      useCase.create({
        trackerId: 'tracker-1',
        userId: 'member-1',
        opponentId: 'member-2',
        durationMinutes: 10,
        questionCount: 5,
      })
    ).resolves.toBe(challenge);
    expect(questionGenerator.generate).toHaveBeenCalledWith({
      context,
      questionCount: 10,
      durationMinutes: 10,
    });
    expect(clans.createChallenge).toHaveBeenCalledWith(expect.objectContaining({ questions }));
    expect(notifier.notify).toHaveBeenCalledWith({
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'pending',
      challengerId: 'member-1',
      opponentId: 'member-2',
    });
    expect(notifications.notify).toHaveBeenCalledWith({
      userId: 'member-2',
      type: 'tracker_clan_challenge_received',
      message: 'Ada challenged you to a guild battle.',
      deepLink: '/trackers/tracker-1/clan/challenges/challenge-1',
      eventId: 'challenge-1:received',
      metadata: { trackerId: 'tracker-1', challengeId: 'challenge-1' },
    });
  });

  it('notifies the challenger when another member accepts the challenge', async () => {
    const clans = repository();
    const challenge = {
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'active',
      challenger: { userId: 'member-1', name: 'Ada', username: 'ada' },
      opponent: { userId: 'member-2', name: 'Lin', username: 'lin' },
    } as TrackerClanChallenge;
    vi.mocked(clans.acceptChallenge).mockResolvedValue(challenge);
    const notifier: ITrackerClanChallengeNotifier = { notify: vi.fn() };
    const notifications: ITrackerClanNotificationNotifier = { notify: vi.fn() };
    const useCase = new TrackerClanChallengeService(
      clans,
      { generate: vi.fn() },
      notifier,
      notifications
    );

    await useCase.accept({
      trackerId: 'tracker-1',
      challengeId: 'challenge-1',
      userId: 'member-2',
    });

    expect(notifications.notify).toHaveBeenCalledWith({
      userId: 'member-1',
      type: 'tracker_clan_challenge_accepted',
      message: 'Lin accepted your guild challenge.',
      deepLink: '/trackers/tracker-1/clan/challenges/challenge-1',
      eventId: 'challenge-1:accepted',
      metadata: { trackerId: 'tracker-1', challengeId: 'challenge-1' },
    });
  });

  it('announces each live race move without exposing question data in the event', async () => {
    const clans = repository();
    const challenge = {
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'active',
      challenger: { userId: 'member-1' },
      opponent: { userId: 'member-2' },
    } as TrackerClanChallenge;
    vi.mocked(clans.answerChallengeNode).mockResolvedValue(challenge);
    const notifier: ITrackerClanChallengeNotifier = { notify: vi.fn() };
    const useCase = new TrackerClanChallengeService(clans, { generate: vi.fn() }, notifier);

    await expect(
      useCase.answerNode({
        trackerId: 'tracker-1',
        challengeId: 'challenge-1',
        userId: 'member-1',
        questionId: 'question-1',
        answer: '42',
      })
    ).resolves.toBe(challenge);
    expect(notifier.notify).toHaveBeenCalledWith({
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'active',
      challengerId: 'member-1',
      opponentId: 'member-2',
    });
  });
});
