import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'

export class GetAIInsightsUseCase {
  constructor(
    private readonly _analyticsRepository: MockTestAnalyticsRepositoryContract,
    private readonly _aiService: MockTestAIServiceContract,
  ) { }

  async execute(userId: string): Promise<{ insight: string }> {
    const [performanceTrends, topicBreakdown] = await Promise.all([
      this._analyticsRepository.getPerformanceTrends(userId),
      this._analyticsRepository.getTopicBreakdown(userId),
    ])

    try {
      const insight = await this._aiService.generatePerformanceInsights({
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
