import { AIGenerationJob } from '../../../../../infrastructure/database/models/ai-generation-job.model';
import { aiQueue } from '../../../../../infrastructure/queue/queues';
import { env } from '../../../../../config/env';
import type { AdaptiveAssessmentPlan } from '../../domain/adaptive-learning.types';
import type { IAdaptiveTestGenerator } from '../../domain/services/adaptive-test-generator.interface';

export class AdaptiveTestGeneratorGateway implements IAdaptiveTestGenerator {
  async generate(userId: string, plan: AdaptiveAssessmentPlan, baselineMasteryScore: number) {
    const payload = {
      topic: plan.topic,
      difficulty: plan.difficulty,
      questionCount: plan.questionCount,
      questionTypes: ['mcq'],
      trackerId: plan.trackerId,
      timeLimitMinutes: Math.max(10, plan.questionCount * 2),
      passingScore: Math.max(45, Math.min(80, plan.predictedScore)),
    } as const;
    const adaptiveContext = { plan, baselineMasteryScore };
    const job = await AIGenerationJob.create({
      userId,
      jobType: 'mock_test',
      status: 'pending',
      inputData: { ...payload, adaptiveContext },
      totalSteps: 1,
      currentStep: 0,
    });
    const jobId = job._id.toString();

    await aiQueue.add(
      'generate-mock-test',
      { jobId, userId, payload, adaptiveContext },
      {
        attempts: env.QUEUE_JOB_ATTEMPTS,
        backoff: { type: 'exponential', delay: env.QUEUE_JOB_BACKOFF_MS },
        removeOnComplete: env.QUEUE_REMOVE_ON_COMPLETE,
        removeOnFail: env.QUEUE_REMOVE_ON_FAIL,
      }
    );

    return { jobId, status: 'pending' as const };
  }
}
