import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import { TestAnalytics } from '../../domain/types/mock-tests.types'

export class GetAnalyticsUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract, private readonly aiService: MockTestAIServiceContract) {}

  async execute(userId: string): Promise<TestAnalytics> {
    const [trends, topicBreakdown] = await Promise.all([this.repo.getPerformanceTrends(userId), this.repo.getTopicBreakdown(userId)])
    let aiInsights = 'Keep practicing to improve your performance.'
    try { aiInsights = await this.aiService.generatePerformanceInsights({ userId, performanceTrends: trends, topicBreakdown }) } catch {}
    return { trends, topicBreakdown, aiInsights }
  }
}
