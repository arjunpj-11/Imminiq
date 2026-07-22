import type { MockTestEntity } from '../entities/mock-test.entity';
import type { DifficultyLevel } from '../value-objects/difficulty-level.vo';

export type CreateMockTestInput = {
  ownerId: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
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

export type UpdateMockTestInput = {
  title?: string;
  description?: string;
  difficulty?: DifficultyLevel;
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

  findTestForModerationDisplayById(testId: string): Promise<MockTestEntity | null>;

  findTestsByOwner(input: FindMockTestsByOwnerInput): Promise<MockTestListResult>;

  createTest(data: CreateMockTestInput): Promise<MockTestEntity>;

  updateTest(testId: string, data: UpdateMockTestInput): Promise<MockTestEntity | null>;

  deleteTest(testId: string): Promise<void>;
}
