import type { MockTestReportEntity } from '../entities/mock-test-report.entity'
export type CreateMockTestReportInput = {
  attemptId: string
  testId: string
  userId: string

  score: number
  maxScore: number
  scorePercentage: number
  passed: boolean

  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  skippedAnswers: number
  timeTakenSeconds: number

  weakTopics: string[]
  strongTopics: string[]
  recommendations: string[]

  generatedAt?: Date
}

export interface IMockTestReportRepository {
  findReportByAttempt(attemptId: string): Promise<MockTestReportEntity | null>

  createReport(data: CreateMockTestReportInput): Promise<MockTestReportEntity>
}