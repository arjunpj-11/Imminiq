import { Worker, type Job } from 'bullmq';

import { env } from '../../../config/env';
import { redis } from '../../../config/redis';
import { createNotificationsComposition } from '../../../modules/notifications';
import { createActivityComposition } from '../../../modules/user/activity';
import { createMockTestsComposition } from '../../../modules/user/mock-tests';
import {
  createTrackerCreationAIJobProcessor,
  type RoadmapEvaluationJobPayload,
  type RoadmapGenerationJobPayload,
} from '../../../modules/user/tracker-creation';
import { createSubscriptionsComposition } from '../../../modules/user/subscriptions';
import { getAIUserMessage } from '../../ai/ai.service';
import { AdaptiveAssessmentModel } from '../../database/models/adaptive-assessment.model';
import { AIGenerationJob } from '../../database/models/ai-generation-job.model';
import { AIGenerationStep } from '../../database/models/ai-generation-step.model';
import { Tracker } from '../../database/models/tracker.model';

const ONE_MINUTE_MS = 60_000;

const notificationsComposition = createNotificationsComposition();
const activityComposition = createActivityComposition();
const mockTestsComposition = createMockTestsComposition(
  activityComposition.useCases.recordActivity
);
const subscriptionsComposition = createSubscriptionsComposition();
const trackerCreationAIJobProcessor = createTrackerCreationAIJobProcessor(
  subscriptionsComposition.helpers.limitEnforcer,
  notificationsComposition.useCases.createNotification
);

type MockTestJobPayload = {
  jobId: string;
  userId: string;
  payload: Parameters<
    ReturnType<typeof createMockTestsComposition>['useCases']['generateMockTest']['execute']
  >[1];
  adaptiveContext?: {
    plan: {
      topic: string;
      trackerId?: string;
      difficulty: 'easy' | 'medium' | 'hard';
      questionCount: number;
      predictedScore: number;
      rationale: string;
      focusAreas: string[];
    };
    baselineMasteryScore: number;
  };
};

const resetCurrentActiveStepToPending = async (jobId: string) => {
  const aiJob = await AIGenerationJob.findById(jobId);
  if (!aiJob?.currentStep) return;

  await AIGenerationStep.findOneAndUpdate(
    { jobId, stepNumber: aiJob.currentStep, status: 'active' },
    { status: 'pending', startedAt: null, completedAt: null }
  );
  await AIGenerationJob.findByIdAndUpdate(jobId, { status: 'pending' });
};

const failCurrentStep = async (jobId: string) => {
  const aiJob = await AIGenerationJob.findById(jobId);
  if (!aiJob?.currentStep) return;

  await AIGenerationStep.findOneAndUpdate(
    { jobId, stepNumber: aiJob.currentStep },
    { status: 'failed', completedAt: new Date() }
  );
};

const isTemporaryProviderError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as {
    status?: number;
    statusCode?: number;
    code?: string;
    message?: string;
  };
  if (candidate.code === 'AI_QUOTA_EXHAUSTED' || candidate.code === 'AI_PROVIDERS_UNAVAILABLE') {
    return false;
  }

  const message = candidate.message?.toLowerCase() ?? '';
  return (
    candidate.status === 429 ||
    candidate.statusCode === 429 ||
    candidate.status === 503 ||
    candidate.statusCode === 503 ||
    ['429', '503', 'resource_exhausted', 'rate limit', 'quota', 'service unavailable', 'high demand', 'unavailable'].some(
      (fragment) => message.includes(fragment)
    )
  );
};

const processMockTest = async ({ jobId, userId, payload, adaptiveContext }: MockTestJobPayload) => {
  await AIGenerationJob.findByIdAndUpdate(jobId, {
    status: 'processing',
    currentStep: 1,
    startedAt: new Date(),
  });

  const test = await mockTestsComposition.useCases.generateMockTest.execute(userId, payload);

  if (adaptiveContext) {
    await AdaptiveAssessmentModel.create({
      userId,
      testId: test._id,
      trackerId: adaptiveContext.plan.trackerId ?? null,
      topic: adaptiveContext.plan.topic,
      difficulty: adaptiveContext.plan.difficulty,
      questionCount: adaptiveContext.plan.questionCount,
      predictedScore: adaptiveContext.plan.predictedScore,
      rationale: adaptiveContext.plan.rationale,
      focusAreas: adaptiveContext.plan.focusAreas,
      baselineMasteryScore: adaptiveContext.baselineMasteryScore,
    });
  }

  await AIGenerationJob.findByIdAndUpdate(jobId, {
    status: 'completed',
    currentStep: 1,
    completedAt: new Date(),
    outputData: { testId: test._id },
  });
  await notificationsComposition.useCases.createNotification.execute({
    userId,
    type: 'mock_test_generation_completed',
    message: adaptiveContext
      ? `Your adaptive assessment “${test.title}” is ready.`
      : `Your mock test “${test.title}” is ready. Go and check it out.`,
    deepLink: `/mock-tests/${test._id}`,
    metadata: { jobId, testId: test._id },
  });
};

const dispatchAIJob = async (job: Job) => {
  if (job.name === 'generate-roadmap') {
    const payload = job.data as RoadmapGenerationJobPayload & { preferredLanguage?: string };
    await trackerCreationAIJobProcessor.processRoadmapGeneration({
      ...payload,
      preferredLanguage: payload.preferredLanguage ?? 'English',
    });
    return;
  }
  if (job.name === 'evaluate-roadmap') {
    await trackerCreationAIJobProcessor.processRoadmapEvaluation(
      job.data as RoadmapEvaluationJobPayload
    );
    return;
  }
  if (job.name === 'generate-mock-test') {
    await processMockTest(job.data as MockTestJobPayload);
    return;
  }
  throw new Error(`Unsupported AI job: ${job.name}`);
};

const handleFailedJob = async (job: Job, error: unknown) => {
  const { jobId } = job.data as { jobId: string };
  const errorMessage = getAIUserMessage(error);
  const internalCode =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code ?? 'UNKNOWN')
      : 'UNKNOWN';

  console.error(
    `[AI job failed] jobId=${jobId} jobName=${job.name} code=${internalCode} ` +
      `message="${error instanceof Error ? error.message : String(error)}"`
  );

  const totalAttempts = job.opts.attempts ?? 1;
  const isFinalAttempt = job.attemptsMade + 1 >= totalAttempts;

  if (!isFinalAttempt) {
    return;
  }

  await failCurrentStep(jobId);
  await AIGenerationJob.findByIdAndUpdate(jobId, {
    status: 'failed',
    errorMessage,
    completedAt: new Date(),
  });

  const evaluationData = job.data as { trackerId?: string; analysisKind?: string };
  if (
    job.name === 'evaluate-roadmap' &&
    evaluationData.analysisKind === 'clone_freshness' &&
    evaluationData.trackerId
  ) {
    await Tracker.updateOne(
      { _id: evaluationData.trackerId, cloneFreshnessAnalysisJobId: jobId },
      { $set: { cloneFreshnessAnalysisStatus: 'failed' } }
    );
  }

  const failedJob = await AIGenerationJob.findById(jobId).lean();
  if (failedJob?.jobType === 'mock_test') {
    await notificationsComposition.useCases.createNotification.execute({
      userId: failedJob.userId.toString(),
      type: 'mock_test_generation_failed',
      message: errorMessage,
      deepLink: '/mock-tests',
      metadata: { jobId },
    });
  }
};

export const aiWorker = new Worker(
  'ai',
  async (job) => {
    const { jobId } = job.data as { jobId: string };
    try {
      await dispatchAIJob(job);
    } catch (error) {
      if (isTemporaryProviderError(error)) {
        console.warn('AI provider is temporarily unavailable. Pausing the AI queue for 60 seconds.');
        await aiWorker.rateLimit(ONE_MINUTE_MS);
        await resetCurrentActiveStepToPending(jobId);
        throw Worker.RateLimitError();
      }
      await handleFailedJob(job, error);
      throw error;
    }
  },
  {
    connection: redis,
    autorun: false,
    concurrency: env.AI_WORKER_CONCURRENCY,
    limiter: { max: env.AI_WORKER_REQUESTS_PER_MINUTE, duration: ONE_MINUTE_MS },
  }
);

let workerStarted = false;

export const startAiWorker = async () => {
  if (workerStarted) return;
  workerStarted = true;

  void aiWorker.run().catch((error: unknown) => {
    if (!aiWorker.closing) console.error('AI worker stopped unexpectedly', error);
  });
  await aiWorker.waitUntilReady();
  console.log('AI worker is ready');
};
