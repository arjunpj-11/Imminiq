import { aiQueue } from '../../../../../infrastructure/queue/queues';
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
      removeOnComplete: 100,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 30_000,
      },
    };
  }
}

export const bullMqAIJobQueueGateway = new BullMqAIJobQueueGateway();
