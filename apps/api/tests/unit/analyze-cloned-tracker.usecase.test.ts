import { describe, expect, it, vi } from 'vitest';

import { buildCloneFreshnessEvaluationPrompt } from '../../src/infrastructure/ai/prompts/roadmap-evaluation.prompt';
import { AnalyzeClonedTrackerUseCase } from '../../src/modules/user/tracker-creation/application/use-cases/analyze-cloned-tracker.usecase';
import { AIGenerationJobEntity } from '../../src/modules/user/tracker-creation/domain/entities/ai-generation-job.entity';

const job = new AIGenerationJobEntity({
  id: 'job-1',
  userId: 'user-1',
  jobType: 'evaluation',
  status: 'pending',
  currentStep: 0,
  totalSteps: 5,
});

const buildDependencies = () => ({
  jobs: {
    createAIJob: vi.fn(),
    createEvaluationAIJob: vi.fn().mockResolvedValue(job),
    createAIJobSteps: vi.fn().mockResolvedValue(undefined),
  },
  clones: {
    claim: vi.fn().mockResolvedValue({
      status: 'claimed' as const,
      sourceTrackerId: 'source-1',
      sourceTrackerCreatedAt: new Date('2025-01-15T00:00:00.000Z'),
    }),
    attachJob: vi.fn().mockResolvedValue(undefined),
    markFailed: vi.fn().mockResolvedValue(undefined),
  },
  queue: {
    enqueueRoadmapGeneration: vi.fn(),
    enqueueRoadmapEvaluation: vi.fn().mockResolvedValue(undefined),
  },
  quota: { consume: vi.fn().mockResolvedValue({ allowed: true }) },
});

describe('AnalyzeClonedTrackerUseCase', () => {
  it('starts a freshness evaluation using the original tracker date', async () => {
    const dependencies = buildDependencies();
    const useCase = new AnalyzeClonedTrackerUseCase(
      dependencies.jobs,
      dependencies.clones,
      dependencies.queue,
      dependencies.quota
    );

    await expect(useCase.execute('clone-1', 'user-1')).resolves.toEqual({ jobId: 'job-1' });
    expect(dependencies.queue.enqueueRoadmapEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({
        trackerId: 'clone-1',
        sourceTrackerId: 'source-1',
        sourceTrackerCreatedAt: '2025-01-15T00:00:00.000Z',
        analysisKind: 'clone_freshness',
      })
    );
    expect(dependencies.clones.attachJob).toHaveBeenCalledWith({
      trackerId: 'clone-1',
      userId: 'user-1',
      jobId: 'job-1',
    });
  });

  it('rejects a second analysis before consuming quota or creating a job', async () => {
    const dependencies = buildDependencies();
    dependencies.clones.claim.mockResolvedValue({ status: 'already_used' });
    const useCase = new AnalyzeClonedTrackerUseCase(
      dependencies.jobs,
      dependencies.clones,
      dependencies.queue,
      dependencies.quota
    );

    await expect(useCase.execute('clone-1', 'user-1')).rejects.toMatchObject({
      code: 'CLONE_FRESHNESS_ANALYSIS_ALREADY_USED',
      kind: 'conflict',
    });
    expect(dependencies.quota.consume).not.toHaveBeenCalled();
    expect(dependencies.jobs.createEvaluationAIJob).not.toHaveBeenCalled();
  });

  it('builds a date-aware prompt that rejects speculative filler', () => {
    const prompt = buildCloneFreshnessEvaluationPrompt(
      { tracker: { title: 'Modern Web Development' }, topics: [] },
      '2025-01-15T00:00:00.000Z'
    );

    expect(prompt).toContain('2025-01-15T00:00:00.000Z');
    expect(prompt).toContain('after the original tracker was created');
    expect(prompt).toContain('speculative trends');
    expect(prompt).toContain('missingTopics');
  });
});
