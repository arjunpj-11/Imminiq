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
  private readonly useCases: MockTestsComposition['useCases']

  constructor(composition: MockTestsComposition) {
    this.useCases = composition.useCases
  }

  listTests(userId: string, options?: { page?: number; limit?: number }) {
    return this.useCases.listMockTests.execute(userId, options)
  }

  listPublicTests(filters: {
    difficulty?: DifficultyLevel
    tags?: string[]
    page?: number
    limit?: number
  }) {
    return this.useCases.listPublicMockTests.execute(filters)
  }

  createTest(userId: string, payload: CreateMockTestPayload) {
    return this.useCases.createMockTest.execute(userId, payload)
  }

  generateTest(userId: string, payload: GenerateMockTestPayload) {
    return this.useCases.generateMockTest.execute(userId, payload)
  }

  shareTest(userId: string, testId: string, origin: string) {
    return this.useCases.shareMockTest.execute({ userId, testId, origin })
  }

  importSharedTest(userId: string, shareToken: string) {
    return this.useCases.importSharedMockTest.execute({ userId, shareToken })
  }

  getTest(testId: string, userId: string) {
    return this.useCases.getMockTestDetails.execute(testId, userId)
  }

  startAttempt(testId: string, userId: string) {
    return this.useCases.startTestAttempt.execute(testId, userId)
  }

  getAttemptQuestions(attemptId: string, userId: string) {
    return this.useCases.getAttemptQuestions.execute(attemptId, userId)
  }

  submitAnswer(
    attemptId: string,
    userId: string,
    payload: SubmitAnswerPayload
  ) {
    return this.useCases.submitAnswer.execute(attemptId, userId, payload)
  }

  flagQuestion(attemptId: string, userId: string, questionId: string) {
    return this.useCases.flagQuestion.execute(attemptId, userId, questionId)
  }

  finishAttempt(attemptId: string, userId: string) {
    return this.useCases.finishTestAttempt.execute(attemptId, userId)
  }

  getAttemptResult(attemptId: string, userId: string) {
    return this.useCases.getAttemptResult.execute(attemptId, userId)
  }

  getAttemptAnalysis(attemptId: string, userId: string) {
    return this.useCases.getAttemptAnalysis.execute(attemptId, userId)
  }

  retakeTest(attemptId: string, userId: string) {
    return this.useCases.retakeTest.execute(attemptId, userId)
  }

  getHistory(userId: string) {
    return this.useCases.getHistory.execute(userId)
  }

  getAnalytics(userId: string) {
    return this.useCases.getAnalytics.execute(userId)
  }

  getAIInsights(userId: string) {
    return this.useCases.getAIInsights.execute(userId)
  }

  getTopicBreakdown(userId: string) {
    return this.useCases.getTopicBreakdown.execute(userId)
  }

  runCode(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: RunMockTestCodePayload
  ) {
    return this.useCases.runMockTestCode.execute(
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
    return this.useCases.submitMockTestCode.execute(
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