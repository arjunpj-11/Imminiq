import type { IMockTestAnalyticsRepository } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { IMockTestAIGateway } from '../../domain/services/mock-test-ai.interface'

export interface IGetAIInsightsUseCase {
  execute(userId: string): Promise<{ insight: string }>
}

export class GetAIInsightsUseCase implements IGetAIInsightsUseCase {
  constructor(
    private readonly _analyticsRepository: IMockTestAnalyticsRepository,
    private readonly _aiGateway: IMockTestAIGateway,
  ) { }

  async execute(userId: string): Promise<{ insight: string }> {
    const [performanceTrends, topicBreakdown] = await Promise.all([
      this._analyticsRepository.getPerformanceTrends(userId),
      this._analyticsRepository.getTopicBreakdown(userId),
    ])

    try {
      const insight = await this._aiGateway.generatePerformanceInsights({
        userId,
        performanceTrends,
        topicBreakdown,
      })

      return { insight }
    } catch {
      return { insight: 'Keep practicing to improve your performance.' }
    }
  }
}
