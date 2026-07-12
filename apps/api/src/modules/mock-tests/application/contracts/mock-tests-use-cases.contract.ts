import type * as Application from '../index'
export type MockTestsUseCases = {
  listMockTests: Application.ListMockTestsUseCase
  listPublicMockTests: Application.ListPublicMockTestsUseCase
  getMockTestDetails: Application.GetMockTestDetailsUseCase
  createMockTest: Application.CreateMockTestUseCase
  generateMockTest: Application.GenerateMockTestUseCase
  startTestAttempt: Application.StartTestAttemptUseCase
  getAttemptQuestions: Application.GetAttemptQuestionsUseCase
  submitAnswer: Application.SubmitAnswerUseCase
  flagQuestion: Application.FlagQuestionUseCase
  finishTestAttempt: Application.FinishTestAttemptUseCase
  getAttemptResult: Application.GetAttemptResultUseCase
  getAttemptAnalysis: Application.GetAttemptAnalysisUseCase
  retakeTest: Application.RetakeTestUseCase
  getAnalytics: Application.GetAnalyticsUseCase
  getAIInsights: Application.GetAIInsightsUseCase
  getHistory: Application.GetHistoryUseCase
  getTopicBreakdown: Application.GetTopicBreakdownUseCase
  shareMockTest: Application.ShareMockTestUseCase
  importSharedMockTest: Application.ImportSharedMockTestUseCase
  runMockTestCode: Application.RunMockTestCodeUseCase
  submitMockTestCode: Application.SubmitMockTestCodeUseCase
}
