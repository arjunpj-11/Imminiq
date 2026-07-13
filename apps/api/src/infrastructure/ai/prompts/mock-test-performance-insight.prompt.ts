export const buildMockTestPerformanceInsightPrompt = (input: {
  performanceTrends: unknown;
  topicBreakdown: unknown;
}): string => `Based on this student's mock test performance data, generate a brief 2-3 sentence personalized insight.

Performance trends: ${JSON.stringify(input.performanceTrends)}
Topic breakdown: ${JSON.stringify(input.topicBreakdown)}

Return only the insight text.`;
