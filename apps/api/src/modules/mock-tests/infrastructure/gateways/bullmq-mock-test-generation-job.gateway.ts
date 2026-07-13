import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'
import { aiQueue } from '../../../../infrastructure/queue/queues'
import type { IGenerateMockTestPayloadDTO } from '../../application/mock-tests.dto'
import type { IMockTestGenerationJobGateway } from '../../application/services/mock-test-generation-job.interface'

export class BullMqMockTestGenerationJobGateway
  implements IMockTestGenerationJobGateway
{
  async enqueue(userId: string, payload: IGenerateMockTestPayloadDTO) {
    const job = await AIGenerationJob.create({
      userId,
      jobType: 'mock_test',
      status: 'pending',
      inputData: { ...payload },
      totalSteps: 1,
      currentStep: 0,
    })
    const jobId = job._id.toString()

    await aiQueue.add(
      'generate-mock-test',
      { jobId, userId, payload },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    )

    return { jobId, status: 'pending' as const }
  }
}

export const bullMqMockTestGenerationJobGateway =
  new BullMqMockTestGenerationJobGateway()
