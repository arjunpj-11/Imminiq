import type * as Application from '../index'
export type MockTestsUseCases = {
  listMockTests: Application.IListMockTestsUseCase
  listPublicMockTests: Application.IListPublicMockTestsUseCase
  getMockTestDetails: Application.IGetMockTestDetailsUseCase
  createMockTest: Application.ICreateMockTestUseCase
  generateMockTest: Application.IGenerateMockTestUseCase
  startTestAttempt: Application.IStartTestAttemptUseCase
  getAttemptQuestions: Application.IGetAttemptQuestionsUseCase
  submitAnswer: Application.ISubmitAnswerUseCase
  flagQuestion: Application.IFlagQuestionUseCase
  finishTestAttempt: Application.IFinishTestAttemptUseCase
  getAttemptResult: Application.IGetAttemptResultUseCase
  getAttemptAnalysis: Application.IGetAttemptAnalysisUseCase
  retakeTest: Application.IRetakeTestUseCase
  getAnalytics: Application.IGetAnalyticsUseCase
  getAIInsights: Application.IGetAIInsightsUseCase
  getHistory: Application.IGetHistoryUseCase
  getTopicBreakdown: Application.IGetTopicBreakdownUseCase
  shareMockTest: Application.IShareMockTestUseCase
  importSharedMockTest: Application.ImportSharedMockTestUseCase
  runMockTestCode: Application.IRunMockTestCodeUseCase
  submitMockTestCode: Application.ISubmitMockTestCodeUseCase
}
