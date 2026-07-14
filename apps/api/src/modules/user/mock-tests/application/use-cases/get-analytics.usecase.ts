import type { IMockTestAnalyticsRepository } from '../../domain/repositories/mock-test-analytics.repository.interface';
import type { IMockTestAIGateway } from '../../domain/services/mock-test-ai.interface';
import type { ITestAnalyticsDTO } from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';

const DEFAULT_AI_INSIGHTS = 'Keep practicing to improve your performance.';

export interface IGetAnalyticsUseCase {
  execute(userId: string): Promise<ITestAnalyticsDTO>;
}

export class GetAnalyticsUseCase implements IGetAnalyticsUseCase {
  constructor(
    private readonly _repository: IMockTestAnalyticsRepository,
    private readonly _aiGateway: IMockTestAIGateway,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(userId: string): Promise<ITestAnalyticsDTO> {
    const [trends, topicBreakdown] = await Promise.all([
      this._repository.getPerformanceTrends(userId),
      this._repository.getTopicBreakdown(userId),
    ]);

    let aiInsights: string;

    try {
      aiInsights = await this._aiGateway.generatePerformanceInsights({
        userId,
        performanceTrends: trends,
        topicBreakdown,
      });
    } catch {
      aiInsights = DEFAULT_AI_INSIGHTS;
    }

    return {
      trends: trends.map((trend) => this._mapper.toPerformanceTrendDto(trend)),
      topicBreakdown: topicBreakdown.map((item) => this._mapper.toTopicBreakdownDto(item)),
      aiInsights,
    };
  }
}
