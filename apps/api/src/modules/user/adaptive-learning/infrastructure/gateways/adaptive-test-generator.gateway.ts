import type { IGenerateMockTestUseCase } from '../../../mock-tests'
import type { AdaptiveAssessmentPlan } from '../../domain/adaptive-learning.types'
import type { IAdaptiveTestGenerator } from '../../domain/services/adaptive-test-generator.interface'

export class AdaptiveTestGeneratorGateway implements IAdaptiveTestGenerator {
  constructor(private readonly _generateMockTest: IGenerateMockTestUseCase) {}

  async generate(userId: string, plan: AdaptiveAssessmentPlan) {
    const test = await this._generateMockTest.execute(userId, {
      topic: plan.topic,
      difficulty: plan.difficulty,
      questionCount: plan.questionCount,
      questionTypes: ['mcq'],
      trackerId: plan.trackerId,
      timeLimitMinutes: Math.max(10, plan.questionCount * 2),
      passingScore: Math.max(45, Math.min(80, plan.predictedScore)),
      visibility: 'private',
    })

    return { testId: test._id, title: test.title }
  }
}
