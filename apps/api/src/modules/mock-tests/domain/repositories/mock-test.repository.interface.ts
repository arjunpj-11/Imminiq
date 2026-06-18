import type { MockTestEntity } from '../entities/mock-test.entity'
import type { DifficultyLevel } from '../value-objects/difficulty-level.vo'
import type { TestVisibility } from '../value-objects/test-visibility.vo'

export interface CreateMockTestInput {
  ownerId: string
  title: string
  description: string
  difficulty: DifficultyLevel
  visibility: TestVisibility
  timeLimitMinutes: number
  passingScore: number
  questionCount: number
  tags: string[]
  trackerId?: string
  sourceTestId?: string
  shareToken?: string
  isShareEnabled?: boolean
  isAIGenerated: boolean
}

export interface FindMockTestsOptions {
  page?: number
  limit?: number
}

export interface FindPublicMockTestsFilters extends FindMockTestsOptions {
  difficulty?: DifficultyLevel
  tags?: string[]
}

export interface MockTestRepositoryContract {
  findTestById(testId: string): Promise<MockTestEntity | null>
  findTestsByOwner(ownerId: string, options?: FindMockTestsOptions): Promise<{ tests: MockTestEntity[]; total: number }>
  findPublicTests(filters: FindPublicMockTestsFilters): Promise<{ tests: MockTestEntity[]; total: number }>
  createTest(data: CreateMockTestInput): Promise<MockTestEntity>
  updateTest(testId: string, data: Partial<MockTestEntity>): Promise<MockTestEntity | null>
  deleteTest(testId: string): Promise<void>
}
