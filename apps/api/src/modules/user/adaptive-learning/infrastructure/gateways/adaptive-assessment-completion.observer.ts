import type { IMockTestCompletionObserver } from '../../../mock-tests'
import type { IAdaptiveLearningRepository } from '../../domain/repositories/adaptive-learning.repository.interface'

export class AdaptiveAssessmentCompletionObserver
  implements IMockTestCompletionObserver
{
  constructor(private readonly _repository: IAdaptiveLearningRepository) {}

  async onCompleted(input: {
    userId: string
    testId: string
    attemptId: string
    scorePercentage: number
  }): Promise<void> {
    try {
      await this._repository.recordAssessmentResult({
        userId: input.userId,
        testId: input.testId,
        attemptId: input.attemptId,
        actualScore: input.scorePercentage,
      })
    } catch (error) {
      // Adaptive progression must never make an already-scored exam fail.
      console.error('[AdaptiveLearning] Failed to update mastery:', error)
    }
  }
}
