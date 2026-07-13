import type { AttemptStatus } from '../value-objects/attempt-status.vo';

export type MockTestAttemptEntityProps = {
  _id: string;
  testId: string;
  userId: string;
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  timeTakenSeconds?: number;
  score?: number;
  scorePercentage?: number;
  passed?: boolean;
  flaggedQuestions: string[];
  totalQuestions: number;
  answeredQuestions: number;
  createdAt: Date;
};

export class MockTestAttemptEntity {
  readonly _id: string;
  readonly testId: string;
  readonly userId: string;
  readonly status: AttemptStatus;
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly timeTakenSeconds?: number;
  readonly score?: number;
  readonly scorePercentage?: number;
  readonly passed?: boolean;
  readonly flaggedQuestions: string[];
  readonly totalQuestions: number;
  readonly answeredQuestions: number;
  readonly createdAt: Date;

  constructor(props: MockTestAttemptEntityProps) {
    this._id = props._id;
    this.testId = props.testId;
    this.userId = props.userId;
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.timeTakenSeconds = props.timeTakenSeconds;
    this.score = props.score;
    this.scorePercentage = props.scorePercentage;
    this.passed = props.passed;
    this.flaggedQuestions = props.flaggedQuestions;
    this.totalQuestions = props.totalQuestions;
    this.answeredQuestions = props.answeredQuestions;
    this.createdAt = props.createdAt;
  }
}
