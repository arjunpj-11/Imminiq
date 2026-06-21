import type { MockTestReportEntity } from '../entities/mock-test-report.entity'

export type CreateMockTestReportInput = {
  attemptId: string
  testId: string
  userId: string
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  totalQuestions: number
  correctAnswers: number
  weakTopics: string[]
  strongTopics: string[]
  recommendations: string[]
  generatedAt?: Date
}

export interface MockTestReportRepositoryContract {
  findReportByAttempt(attemptId: string): Promise<MockTestReportEntity | null>

  createReport(data: CreateMockTestReportInput): Promise<MockTestReportEntity>
}