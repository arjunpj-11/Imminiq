import type {
  CreateMockTestPayload,
  DifficultyLevel,
  GenerateMockTestPayload,
  RunMockTestCodePayload,
  SubmitAnswerPayload,
  SubmitMockTestCodePayload,
} from './application/dtos/mock-tests.dto'
import {
  createMockTestsComposition,
  type MockTestsComposition,
} from './mock-tests.factory'

export class MockTestsService {
  private readonly _useCases: MockTestsComposition['useCases']

  constructor(composition: MockTestsComposition) {
    this._useCases = composition.useCases
  }

  listTests(userId: string, options?: { page?: number; limit?: number }) {
    return this._useCases.listMockTests.execute(userId, options)
  }

  listPublicTests(filters: {
    difficulty?: DifficultyLevel
    tags?: string[]
    page?: number
    limit?: number
  }) {
    return this._useCases.listPublicMockTests.execute(filters)
  }

  createTest(userId: string, payload: CreateMockTestPayload) {
    return this._useCases.createMockTest.execute(userId, payload)
  }

  generateTest(userId: string, payload: GenerateMockTestPayload) {
    return this._useCases.generateMockTest.execute(userId, payload)
  }

  shareTest(userId: string, testId: string, origin: string) {
    return this._useCases.shareMockTest.execute({ userId, testId, origin })
  }

  importSharedTest(userId: string, shareToken: string) {
    return this._useCases.importSharedMockTest.execute({ userId, shareToken })
  }

  getTest(testId: string, userId: string) {
    return this._useCases.getMockTestDetails.execute(testId, userId)
  }

  startAttempt(testId: string, userId: string) {
    return this._useCases.startTestAttempt.execute(testId, userId)
  }

  getAttemptQuestions(attemptId: string, userId: string) {
    return this._useCases.getAttemptQuestions.execute(attemptId, userId)
  }

  submitAnswer(
    attemptId: string,
    userId: string,
    payload: SubmitAnswerPayload
  ) {
    return this._useCases.submitAnswer.execute(attemptId, userId, payload)
  }

  flagQuestion(attemptId: string, userId: string, questionId: string) {
    return this._useCases.flagQuestion.execute(attemptId, userId, questionId)
  }

  finishAttempt(attemptId: string, userId: string) {
    return this._useCases.finishTestAttempt.execute(attemptId, userId)
  }

  getAttemptResult(attemptId: string, userId: string) {
    return this._useCases.getAttemptResult.execute(attemptId, userId)
  }

  getAttemptAnalysis(attemptId: string, userId: string) {
    return this._useCases.getAttemptAnalysis.execute(attemptId, userId)
  }

  retakeTest(attemptId: string, userId: string) {
    return this._useCases.retakeTest.execute(attemptId, userId)
  }

  getHistory(userId: string) {
    return this._useCases.getHistory.execute(userId)
  }

  getAnalytics(userId: string) {
    return this._useCases.getAnalytics.execute(userId)
  }

  getAIInsights(userId: string) {
    return this._useCases.getAIInsights.execute(userId)
  }

  getTopicBreakdown(userId: string) {
    return this._useCases.getTopicBreakdown.execute(userId)
  }

  runCode(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: RunMockTestCodePayload
  ) {
    return this._useCases.runMockTestCode.execute(
      attemptId,
      userId,
      questionId,
      payload
    )
  }

  submitCode(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: SubmitMockTestCodePayload
  ) {
    return this._useCases.submitMockTestCode.execute(
      attemptId,
      userId,
      questionId,
      payload
    )
  }
}

export const mockTestsService = new MockTestsService(
  createMockTestsComposition()
)