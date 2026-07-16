import type { DifficultyLevel } from '../value-objects/difficulty-level.vo';
import type { TestVisibility } from '../value-objects/test-visibility.vo';

export type MockTestEntityProps = {
  _id: string;
  ownerId: string;
  trackerId?: string;
  sourceTestId?: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  visibility: TestVisibility;
  moderationStatus: 'active' | 'suspended' | 'deleted';
  moderationReason?: string;
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  isAIGenerated: boolean;
  tags: string[];
  shareToken?: string;
  isShareEnabled: boolean;
  cloneCount: number;
  averageScore: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export class MockTestEntity {
  readonly _id: string;
  readonly ownerId: string;
  readonly trackerId?: string;
  readonly sourceTestId?: string;
  readonly title: string;
  readonly description: string;
  readonly difficulty: DifficultyLevel;
  readonly visibility: TestVisibility;
  readonly moderationStatus: 'active' | 'suspended' | 'deleted';
  readonly moderationReason?: string;
  readonly questionCount: number;
  readonly timeLimitMinutes: number;
  readonly passingScore: number;
  readonly isAIGenerated: boolean;
  readonly tags: string[];
  readonly shareToken?: string;
  readonly isShareEnabled: boolean;
  readonly cloneCount: number;
  readonly averageScore: number;
  readonly attemptCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: MockTestEntityProps) {
    this._id = props._id;
    this.ownerId = props.ownerId;
    this.trackerId = props.trackerId;
    this.sourceTestId = props.sourceTestId;
    this.title = props.title;
    this.description = props.description;
    this.difficulty = props.difficulty;
    this.visibility = props.visibility;
    this.moderationStatus = props.moderationStatus;
    this.moderationReason = props.moderationReason;
    this.questionCount = props.questionCount;
    this.timeLimitMinutes = props.timeLimitMinutes;
    this.passingScore = props.passingScore;
    this.isAIGenerated = props.isAIGenerated;
    this.tags = props.tags;
    this.shareToken = props.shareToken;
    this.isShareEnabled = props.isShareEnabled;
    this.cloneCount = props.cloneCount;
    this.averageScore = props.averageScore;
    this.attemptCount = props.attemptCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
