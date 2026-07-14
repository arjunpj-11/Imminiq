import { AIGenerationJob } from '../../../../../infrastructure/database/models/ai-generation-job.model';
import { aiQueue } from '../../../../../infrastructure/queue/queues';
import { env } from '../../../../../config/env';
import type { GenerateMockTestPayloadDTO } from '../../application/mock-tests.dto';
import type { IMockTestGenerationJobGateway } from '../../application/services/mock-test-generation-job.interface';

export class BullMqMockTestGenerationJobGateway implements IMockTestGenerationJobGateway {
  async findActive(userId: string) {
    const job = await AIGenerationJob.findOne({
      userId,
      jobType: 'mock_test',
      status: { $in: ['pending', 'processing'] },
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .select('_id status')
      .lean<{ _id: { toString(): string }; status: 'pending' | 'processing' }>();

    return job ? { jobId: job._id.toString(), status: job.status } : null;
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

    await aiQueue.add(
      'generate-mock-test',
      { jobId, userId, payload },
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

export const bullMqMockTestGenerationJobGateway = new BullMqMockTestGenerationJobGateway();
