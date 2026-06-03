import { MockTest, MockTestQuestion, MockTestAttempt, MockTestAnswer, MockTestAIEvaluation, MockTestReport, MockTestCreationSession, CreateMockTestPayload, QuestionType, DifficultyLevel, TestVisibility, MockTestSummary } from '../types/mock-tests.types'

export interface MockTestsRepositoryContract {
  findTestById(testId: string): Promise<MockTest | null>
  findTestsByOwner(ownerId: string): Promise<MockTest[]>
  findPublicTests(filters: { difficulty?: DifficultyLevel; tags?: string[]; page?: number; limit?: number }): Promise<{ tests: MockTest[]; total: number }>
  createTest(data: { ownerId: string; title: string; description: string; difficulty: DifficultyLevel; visibility: TestVisibility; timeLimitMinutes: number; passingScore: number; questionCount: number; tags: string[]; trackerId?: string; isAIGenerated: boolean }): Promise<MockTest>
  updateTest(testId: string, data: Partial<MockTest>): Promise<MockTest | null>
  deleteTest(testId: string): Promise<void>

  findQuestionsByTest(testId: string): Promise<MockTestQuestion[]>
  findQuestionById(questionId: string): Promise<MockTestQuestion | null>
  createQuestions(questions: { testId: string; type: QuestionType; question: string; options?: string[]; correctAnswer?: string; explanation?: string; difficulty: DifficultyLevel; order: number; points: number }[]): Promise<MockTestQuestion[]>

  findAttemptById(attemptId: string): Promise<MockTestAttempt | null>
  findAttemptsByUser(userId: string, testId?: string): Promise<MockTestAttempt[]>
  findLatestAttemptsForTests(userId: string, testIds: string[]): Promise<Record<string, MockTestAttempt>>
  findActiveAttempt(userId: string, testId: string): Promise<MockTestAttempt | null>
  createAttempt(data: { testId: string; userId: string; totalQuestions: number }): Promise<MockTestAttempt>
  updateAttempt(attemptId: string, data: Partial<MockTestAttempt>): Promise<MockTestAttempt | null>
  incrementAnsweredCount(attemptId: string): Promise<void>
  abandonActiveAttempts(userId: string, testId: string): Promise<void>

  findAnswersByAttempt(attemptId: string): Promise<MockTestAnswer[]>
  findAnswerByQuestion(attemptId: string, questionId: string): Promise<MockTestAnswer | null>
  saveAnswer(data: { attemptId: string; questionId: string; answer: string; isCorrect?: boolean; pointsEarned?: number }): Promise<MockTestAnswer>
  updateAnswer(answerId: string, data: Partial<MockTestAnswer>): Promise<MockTestAnswer | null>
  flagQuestion(attemptId: string, questionId: string): Promise<void>
  unflagQuestion(attemptId: string, questionId: string): Promise<void>

  createAIEvaluation(data: { attemptId: string; questionId: string; answerId: string; score: number; maxScore: number; feedback: string }): Promise<MockTestAIEvaluation>
  findAIEvaluationsByAttempt(attemptId: string): Promise<MockTestAIEvaluation[]>

  findReportByAttempt(attemptId: string): Promise<MockTestReport | null>
  createReport(data: Omit<MockTestReport, '_id' | 'createdAt'>): Promise<MockTestReport>

  getAttemptHistory(userId: string): Promise<(MockTestAttempt & { test: MockTest | null })[]>
  getUserSummary(userId: string): Promise<MockTestSummary>
  getPerformanceTrends(userId: string): Promise<{ date: string; averageScore: number; attempts: number }[]>
  getTopicBreakdown(userId: string): Promise<{ topic: string; averageScore: number; totalAttempts: number }[]>
  updateAnalyticsSnapshot(testId: string): Promise<void>

  findCreationSession(sessionId: string): Promise<MockTestCreationSession | null>
  findActiveCreationSession(userId: string): Promise<MockTestCreationSession | null>
  createCreationSession(userId: string): Promise<MockTestCreationSession>
  updateCreationSession(sessionId: string, data: Partial<MockTestCreationSession>): Promise<MockTestCreationSession | null>
  cancelCreationSession(sessionId: string): Promise<void>
}
