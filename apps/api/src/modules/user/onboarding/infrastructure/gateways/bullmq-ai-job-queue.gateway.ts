import { aiQueue } from '../../../../../infrastructure/queue/queues';
import { env } from '../../../../../config/env';
import { OnboardingDomainError } from '../../domain/onboarding-domain.error';
import type {
  IAIJobQueueGateway,
  IEvaluateRoadmapQueuePayload,
  IGenerateRoadmapQueuePayload,
} from '../../domain/services/ai-job-queue.interface';

export class BullMqAIJobQueueGateway implements IAIJobQueueGateway {
  async enqueueRoadmapGeneration(payload: IGenerateRoadmapQueuePayload): Promise<void> {
    await this.enqueue('generate-roadmap', payload);
  }

  async enqueueRoadmapEvaluation(payload: IEvaluateRoadmapQueuePayload): Promise<void> {
    await this.enqueue('evaluate-roadmap', payload);
  }

  private async enqueue(
    jobName: string,
    payload: IGenerateRoadmapQueuePayload | IEvaluateRoadmapQueuePayload
  ): Promise<void> {
    try {
      await aiQueue.add(jobName, payload, this.getQueueOptions());
    } catch {
      throw new OnboardingDomainError('AI_QUEUE_ERROR', 'Failed to enqueue onboarding AI job');
    }
  }

  private getQueueOptions() {
    return {
      removeOnComplete: env.QUEUE_REMOVE_ON_COMPLETE,
      removeOnFail: env.QUEUE_REMOVE_ON_FAIL,
      attempts: env.QUEUE_JOB_ATTEMPTS,
      backoff: {
        type: 'exponential',
        delay: env.QUEUE_JOB_BACKOFF_MS,
      },
    };
  }
}

export const bullMqAIJobQueueGateway = new BullMqAIJobQueueGateway();
