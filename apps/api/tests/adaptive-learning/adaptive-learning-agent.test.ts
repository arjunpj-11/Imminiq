import { beforeEach, describe, expect, it, vi } from 'vitest';

const ai = vi.hoisted(() => ({
  economyAIChatWithFallback: vi.fn(),
  economyAIStructuredWithFallback: vi.fn(),
}));

vi.mock('../../src/infrastructure/ai/ai.service', () => ai);

import { AdaptiveLearningAgent } from '../../src/modules/user/adaptive-learning/infrastructure/services/adaptive-learning-agent.service';
import type { IAdaptiveLearningAgent } from '../../src/modules/user/adaptive-learning/domain/services/adaptive-learning-agent.interface';

const input = (question: string): Parameters<IAdaptiveLearningAgent['answer']>[0] => ({
  question,
  snapshot: {
    user: { fullName: 'Test Learner', xpLevel: 3, xp: 1400, streakCount: 4 },
    trackers: [
      {
        id: '64b000000000000000000001',
        title: 'Data Structures',
        field: 'Computer Science',
        goal: 'Prepare for interviews',
        level: 'intermediate',
        progressPercent: 35,
      },
    ],
    recentPerformance: [
      {
        testId: '64b000000000000000000002',
        title: 'Arrays quiz',
        scorePercentage: 42,
        weakTopics: ['two pointers'],
        strongTopics: ['array syntax'],
        completedAt: new Date('2026-07-16T12:00:00.000Z'),
      },
    ],
    averageScore: 42,
  },
  profile: { masteryScore: 48, level: 'developing', history: [] },
  history: [],
});

describe('AdaptiveLearningAgent advisor recovery', () => {
  beforeEach(() => vi.clearAllMocks());

  it('plans and calibrates an assessment with one structured model request', async () => {
    ai.economyAIStructuredWithFallback.mockResolvedValueOnce({
      topic: 'Two pointers',
      trackerId: 'not-a-learner-tracker',
      difficulty: 'medium',
      questionCount: 11,
      predictedScore: 99,
      rationale: 'Recent performance shows that this topic needs focused practice.',
      focusAreas: ['two pointers', 'two pointers', 'sliding window'],
    });

    const learnerInput = input('What should I study next?');
    const plan = await new AdaptiveLearningAgent().planAssessment({
      snapshot: learnerInput.snapshot,
      profile: learnerInput.profile,
    });

    expect(ai.economyAIStructuredWithFallback).toHaveBeenCalledTimes(1);
    expect(plan).toEqual({
      topic: 'Two pointers',
      trackerId: '64b000000000000000000001',
      difficulty: 'medium',
      questionCount: 11,
      predictedScore: 95,
      rationale: 'Recent performance shows that this topic needs focused practice.',
      focusAreas: ['two pointers', 'sliding window'],
    });
  });

  it('uses a plain-text model response when structured output fails', async () => {
    ai.economyAIStructuredWithFallback.mockRejectedValueOnce(
      new Error('invalid structured response')
    );
    ai.economyAIChatWithFallback.mockResolvedValueOnce(
      'Review two pointers next, then take a short arrays quiz.'
    );

    await expect(
      new AdaptiveLearningAgent().answer(input('What should I study next?'))
    ).resolves.toEqual({
      content: 'Review two pointers next, then take a short arrays quiz.',
    });
    expect(ai.economyAIChatWithFallback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: expect.stringContaining('two pointers') }),
      ]),
      'fast',
      'adaptive_learning',
      expect.objectContaining({ operation: 'adaptive-learning-advisor-text-recovery' })
    );
  });

  it('returns a question-aware test recommendation when every provider is unavailable', async () => {
    ai.economyAIStructuredWithFallback.mockRejectedValue(new Error('provider unavailable'));
    ai.economyAIChatWithFallback.mockRejectedValue(new Error('provider unavailable'));

    const answer = await new AdaptiveLearningAgent().answer(
      input('Which mock test should I take?')
    );

    expect(answer.content).toContain('two pointers');
    expect(answer.content).toContain('42%');
    expect(answer.action).toMatchObject({
      type: 'create_mock_test',
      topic: 'two pointers',
      difficulty: 'easy',
      questionCount: 10,
    });
  });

  it('does not repeat the same generic message for different learner questions', async () => {
    ai.economyAIStructuredWithFallback.mockRejectedValue(new Error('provider unavailable'));
    ai.economyAIChatWithFallback.mockRejectedValue(new Error('provider unavailable'));
    const agent = new AdaptiveLearningAgent();

    const weakAreaAnswer = await agent.answer(input('What is my weakest area?'));
    const nextStepAnswer = await agent.answer(input('What should I study today?'));

    expect(weakAreaAnswer.content).toContain('two pointers');
    expect(nextStepAnswer.content).toContain('35% complete');
    expect(weakAreaAnswer.content).not.toBe(nextStepAnswer.content);
  });

  it('does not offer a duplicate tracker when the learner already has one for that topic', async () => {
    ai.economyAIStructuredWithFallback.mockResolvedValueOnce({
      content: 'Create a data structures tracker.',
      action: {
        type: 'create_tracker',
        label: 'Create Data Structures',
        topic: 'Data Structures',
        goal: 'Prepare for interviews',
        level: 'intermediate',
      },
    });

    await expect(
      new AdaptiveLearningAgent().answer(input('What should I create?'))
    ).resolves.toEqual({
      content:
        'You already have “Data Structures”, which covers Computer Science. Continue that tracker instead of creating another one for the same subject.',
    });
  });
});
