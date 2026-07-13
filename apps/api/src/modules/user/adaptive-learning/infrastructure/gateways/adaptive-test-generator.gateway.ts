import { AIGenerationJob } from '../../../../../infrastructure/database/models/ai-generation-job.model'
import { aiQueue } from '../../../../../infrastructure/queue/queues'
import type { AdaptiveAssessmentPlan } from '../../domain/adaptive-learning.types'
import type { IAdaptiveTestGenerator } from '../../domain/services/adaptive-test-generator.interface'

export class AdaptiveTestGeneratorGateway implements IAdaptiveTestGenerator {
  async generate(
    userId: string,
    plan: AdaptiveAssessmentPlan,
    baselineMasteryScore: number,
  ) {
    const payload = {
      topic: plan.topic,
      difficulty: plan.difficulty,
      questionCount: plan.questionCount,
      questionTypes: ['mcq'],
      trackerId: plan.trackerId,
      timeLimitMinutes: Math.max(10, plan.questionCount * 2),
      passingScore: Math.max(45, Math.min(80, plan.predictedScore)),
      visibility: 'private',
    } as const
    const adaptiveContext = { plan, baselineMasteryScore }
    const job = await AIGenerationJob.create({
      userId,
      jobType: 'mock_test',
      status: 'pending',
      inputData: { ...payload, adaptiveContext },
      totalSteps: 1,
      currentStep: 0,
    })
    const jobId = job._id.toString()

    await aiQueue.add(
      'generate-mock-test',
      { jobId, userId, payload, adaptiveContext },
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
