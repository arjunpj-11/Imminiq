import { AIGenerationJob } from '../../../../../infrastructure/database/models/ai-generation-job.model';
import { aiQueue } from '../../../../../infrastructure/queue/queues';
import { env } from '../../../../../config/env';
import {
  enqueueAIJobOrMarkFailed,
  findActiveAIJob,
} from '../../../../../infrastructure/queue/ai-job-enqueue';
import type { GenerateMockTestPayloadDTO } from '../../application/mock-tests.dto';
import type { IMockTestGenerationJobGateway } from '../../application/services/mock-test-generation-job.interface';

export class BullMqMockTestGenerationJobGateway implements IMockTestGenerationJobGateway {
  async findActive(userId: string) {
    return findActiveAIJob({ userId, jobType: 'mock_test' });
  }

  async getStatus(userId: string, jobId: string) {
    const job = await AIGenerationJob.findOne({
      _id: jobId,
      userId,
      jobType: 'mock_test',
      deletedAt: null,
    })
      .select({ status: 1, outputData: 1, errorMessage: 1 })
      .lean();

    if (!job) return null;

    const outputData = job.outputData as { testId?: unknown } | undefined;
    const testId = typeof outputData?.testId === 'string' ? outputData.testId : undefined;

    return {
      jobId: job._id.toString(),
      status: job.status,
      ...(testId ? { testId } : {}),
      ...(job.errorMessage ? { errorMessage: job.errorMessage } : {}),
    };
  }

  async enqueue(userId: string, payload: GenerateMockTestPayloadDTO) {
    const job = await AIGenerationJob.create({
      userId,
      jobType: 'mock_test',
      status: 'pending',
      inputData: { ...payload },
      totalSteps: 1,
      currentStep: 0,
    });
    const jobId = job._id.toString();

    await enqueueAIJobOrMarkFailed(jobId, () =>
      aiQueue.add(
        'generate-mock-test',
        { jobId, userId, payload },
        {
          attempts: env.QUEUE_JOB_ATTEMPTS,
          backoff: { type: 'exponential', delay: env.QUEUE_JOB_BACKOFF_MS },
          removeOnComplete: env.QUEUE_REMOVE_ON_COMPLETE,
          removeOnFail: env.QUEUE_REMOVE_ON_FAIL,
        }
      )
    );

    return { jobId, status: 'pending' as const };
  }
}

export const bullMqMockTestGenerationJobGateway = new BullMqMockTestGenerationJobGateway();
