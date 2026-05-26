import { aiQueue } from '../../../../infrastructure/queue/queues'

import type {
  AIJobQueueGateway,
  EvaluateRoadmapQueuePayload,
  GenerateRoadmapQueuePayload,
} from '../../domain/services/ai-job-queue.gateway.interface'

export const bullMqAIJobQueueGateway: AIJobQueueGateway = {
  enqueueRoadmapGeneration: async (
    payload: GenerateRoadmapQueuePayload
  ) => {
    await aiQueue.add(
      'generate-roadmap',
      payload,
      {
        removeOnComplete: 100,
        removeOnFail: 100,

        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 30_000,
        },
      }
    )
  },

  enqueueRoadmapEvaluation: async (
    payload: EvaluateRoadmapQueuePayload
  ) => {
    await aiQueue.add(
      'evaluate-roadmap',
      payload,
      {
        removeOnComplete: 100,
        removeOnFail: 100,

        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 30_000,
        },
      }
    )
  },
}
