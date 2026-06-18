import type { MockTestReportEntity } from '../entities/mock-test-report.entity'

export type CreateMockTestReportInput = Omit<
  MockTestReportEntity,
  '_id' | 'createdAt'
>

export interface MockTestReportRepositoryContract {
  findReportByAttempt(attemptId: string): Promise<MockTestReportEntity | null>
  createReport(data: CreateMockTestReportInput): Promise<MockTestReportEntity>
}