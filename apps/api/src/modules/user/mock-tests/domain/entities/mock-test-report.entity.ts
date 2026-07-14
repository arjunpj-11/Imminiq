export type MockTestReportEntityProps = {
  _id: string;
  attemptId: string;
  userId: string;
  testId: string;
  score: number;
  scorePercentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  strongTopics: string[];
  weakTopics: string[];
  recommendations: string[];
  createdAt: Date;
};

export class MockTestReportEntity {
  readonly _id: string;
  readonly attemptId: string;
  readonly userId: string;
  readonly testId: string;
  readonly score: number;
  readonly scorePercentage: number;
  readonly passed: boolean;
  readonly timeTakenSeconds: number;
  readonly totalQuestions: number;
  readonly correctAnswers: number;
  readonly incorrectAnswers: number;
  readonly skippedAnswers: number;
  readonly strongTopics: string[];
  readonly weakTopics: string[];
  readonly recommendations: string[];
  readonly createdAt: Date;

  constructor(props: MockTestReportEntityProps) {
    this._id = props._id;
    this.attemptId = props.attemptId;
    this.userId = props.userId;
    this.testId = props.testId;
    this.score = props.score;
    this.scorePercentage = props.scorePercentage;
    this.passed = props.passed;
    this.timeTakenSeconds = props.timeTakenSeconds;
    this.totalQuestions = props.totalQuestions;
    this.correctAnswers = props.correctAnswers;
    this.incorrectAnswers = props.incorrectAnswers;
    this.skippedAnswers = props.skippedAnswers;
    this.strongTopics = props.strongTopics;
    this.weakTopics = props.weakTopics;
    this.recommendations = props.recommendations;
    this.createdAt = props.createdAt;
  }
}
