import type { MockTestEntity } from '../entities/mock-test.entity';
import type { DifficultyLevel } from '../value-objects/difficulty-level.vo';
import type { TestVisibility } from '../value-objects/test-visibility.vo';

export type CreateMockTestInput = {
  ownerId: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  visibility: TestVisibility;
  timeLimitMinutes: number;
  passingScore: number;
  questionCount: number;
  tags: string[];
  trackerId?: string;
  sourceTestId?: string;
  shareToken?: string;
  isShareEnabled?: boolean;
  isAIGenerated: boolean;
};

export type FindMockTestsByOwnerInput = {
  ownerId: string;
  page?: number;
  limit?: number;
};

export type FindPublicMockTestsInput = {
  page?: number;
  limit?: number;
  difficulty?: DifficultyLevel;
  tags?: string[];
};

export type UpdateMockTestInput = {
  title?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  visibility?: TestVisibility;
  timeLimitMinutes?: number;
  passingScore?: number;
  questionCount?: number;
  tags?: string[];
  trackerId?: string;
  sourceTestId?: string;
  shareToken?: string;
  isShareEnabled?: boolean;
  isAIGenerated?: boolean;
  cloneCount?: number;
};

export type MockTestListResult = {
  tests: MockTestEntity[];
  total: number;
};

export interface IMockTestRepository {
  findTestById(testId: string): Promise<MockTestEntity | null>;

  findTestsByOwner(input: FindMockTestsByOwnerInput): Promise<MockTestListResult>;

  findPublicTests(input: FindPublicMockTestsInput): Promise<MockTestListResult>;

  createTest(data: CreateMockTestInput): Promise<MockTestEntity>;

  updateTest(testId: string, data: UpdateMockTestInput): Promise<MockTestEntity | null>;

  deleteTest(testId: string): Promise<void>;
}
