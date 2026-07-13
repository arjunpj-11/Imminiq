import type {
  MockTestAttemptHistoryItem,
  MockTestPerformanceTrend,
  MockTestSummary,
  MockTestTopicBreakdown,
} from '../value-objects/mock-test-analytics.vo'

export interface IMockTestAnalyticsRepository {
  getAttemptHistory(userId: string): Promise<MockTestAttemptHistoryItem[]>

  getUserSummary(userId: string): Promise<MockTestSummary>

  getPerformanceTrends(userId: string): Promise<MockTestPerformanceTrend[]>

  getTopicBreakdown(userId: string): Promise<MockTestTopicBreakdown[]>

  updateAnalyticsSnapshot(testId: string): Promise<void>
}