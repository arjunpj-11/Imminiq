import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import type { TestAnalytics } from '../dtos/mock-tests.dto'

const DEFAULT_AI_INSIGHTS = 'Keep practicing to improve your performance.'

export class GetAnalyticsUseCase {
  constructor(
    private readonly _repo: MockTestAnalyticsRepositoryContract,
    private readonly _aiService: MockTestAIServiceContract,
  ) {}

  async execute(userId: string): Promise<TestAnalytics> {
    const [trends, topicBreakdown] = await Promise.all([
      this._repo.getPerformanceTrends(userId),
      this._repo.getTopicBreakdown(userId),
    ])

    let aiInsights: string

    try {
      aiInsights = await this._aiService.generatePerformanceInsights({
        userId,
        performanceTrends: trends,
        topicBreakdown,
      })
    } catch {
      aiInsights = DEFAULT_AI_INSIGHTS
    }

    return { trends, topicBreakdown, aiInsights }
  }
}