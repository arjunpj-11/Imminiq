import { describe, expect, it, vi } from 'vitest';

import { GenerateAdaptiveAssessmentUseCase } from '../../src/modules/user/adaptive-learning/application/use-cases/generate-adaptive-assessment.usecase';
import { AdaptiveLearningMapper } from '../../src/modules/user/adaptive-learning/application/adaptive-learning.mapper';

const snapshot = {
  user: { fullName: 'Learner', xpLevel: 1, xp: 0, streakCount: 0 },
  trackers: [
    {
      id: 'tracker-1',
      title: 'System Design',
      field: 'Engineering',
      goal: 'Interview preparation',
      level: 'intermediate',
      progressPercent: 30,
    },
  ],
  recentPerformance: [],
  averageScore: null,
};

const profile = {
  masteryScore: 40,
  level: 'developing' as const,
  history: [],
};

const plan = {
  topic: 'System Design',
  trackerId: 'tracker-1',
  difficulty: 'medium' as const,
  questionCount: 10,
  predictedScore: 60,
  rationale: 'Checks the learner’s current system-design understanding.',
  focusAreas: ['Scalability'],
};

const buildDependencies = () => ({
  repository: {
    getLearnerSnapshot: vi.fn().mockResolvedValue(snapshot),
    getOrCreateProfile: vi.fn().mockResolvedValue(profile),
  },
  agent: {
    planAssessment: vi.fn().mockResolvedValue(plan),
    answer: vi.fn(),
  },
  generator: {
    findActive: vi.fn().mockResolvedValue(null),
    generate: vi.fn().mockResolvedValue({ jobId: 'job-1', status: 'pending' as const }),
  },
});

describe('GenerateAdaptiveAssessmentUseCase', () => {
  it('uses the adaptive plan to start a background mock-test job', async () => {
    const dependencies = buildDependencies();
    const useCase = new GenerateAdaptiveAssessmentUseCase(
      dependencies.repository,
      dependencies.agent,
      dependencies.generator,
      new AdaptiveLearningMapper()
    );

    await expect(useCase.execute('user-1')).resolves.toEqual({
      jobId: 'job-1',
      status: 'pending',
    });
    expect(dependencies.generator.generate).toHaveBeenCalledWith('user-1', plan, 40);
  });

  it('does not start a second adaptive exam while another mock test is generating', async () => {
    const dependencies = buildDependencies();
    dependencies.generator.findActive.mockResolvedValue({
      jobId: 'active-job',
      status: 'processing',
    });
    const useCase = new GenerateAdaptiveAssessmentUseCase(
      dependencies.repository,
      dependencies.agent,
      dependencies.generator,
      new AdaptiveLearningMapper()
    );

    await expect(useCase.execute('user-1')).rejects.toMatchObject({
      code: 'ADAPTIVE_ASSESSMENT_GENERATION_ACTIVE',
      kind: 'conflict',
    });
    expect(dependencies.repository.getLearnerSnapshot).not.toHaveBeenCalled();
    expect(dependencies.generator.generate).not.toHaveBeenCalled();
  });
});
