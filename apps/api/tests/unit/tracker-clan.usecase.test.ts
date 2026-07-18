import { describe, expect, it, vi } from 'vitest';

import { TrackerClanUseCase } from '../../src/modules/user/trackers/application/use-cases/tracker-clan.usecase';
import { TrackerClanChallengeUseCase } from '../../src/modules/user/trackers/application/use-cases/tracker-clan-challenge.usecase';
import type {
  ITrackerClanChallengeNotifier,
  ITrackerClanChallengeQuestionGenerator,
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
    getChallengeQuestionContext: vi.fn(),
    createChallenge: vi.fn(),
    acceptChallenge: vi.fn(),
    declineChallenge: vi.fn(),
    cancelChallenge: vi.fn(),
    submitChallenge: vi.fn(),
    chooseChallengeCheckpoint: vi.fn(),
    answerChallengeNode: vi.fn(),
    useChallengePower: vi.fn(),
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
      status: 'open',
      challenger: { userId: 'member-1' },
      opponent: null,
    } as TrackerClanChallenge;
    vi.mocked(clans.createChallenge).mockResolvedValue(challenge);
    const questionGenerator: ITrackerClanChallengeQuestionGenerator = { generate: vi.fn() };
    vi.mocked(questionGenerator.generate).mockResolvedValue(questions);
    const notifier: ITrackerClanChallengeNotifier = { notify: vi.fn() };
    const useCase = new TrackerClanChallengeUseCase(clans, questionGenerator, notifier);

    await expect(
      useCase.create({
        trackerId: 'tracker-1',
        userId: 'member-1',
        durationMinutes: 10,
        questionCount: 5,
      })
    ).resolves.toBe(challenge);
    expect(questionGenerator.generate).toHaveBeenCalledWith({
      context,
      questionCount: 5,
      durationMinutes: 10,
    });
    expect(clans.createChallenge).toHaveBeenCalledWith(
      expect.objectContaining({ questions })
    );
    expect(notifier.notify).toHaveBeenCalledWith({
      id: 'challenge-1',
      trackerId: 'tracker-1',
      status: 'open',
      challengerId: 'member-1',
      opponentId: null,
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
    const useCase = new TrackerClanChallengeUseCase(
      clans,
      { generate: vi.fn() },
      notifier
    );

    await expect(useCase.answerNode({
      trackerId: 'tracker-1', challengeId: 'challenge-1', userId: 'member-1', answer: '42',
    })).resolves.toBe(challenge);
    expect(notifier.notify).toHaveBeenCalledWith({
      id: 'challenge-1', trackerId: 'tracker-1', status: 'active',
      challengerId: 'member-1', opponentId: 'member-2',
    });
  });
});
