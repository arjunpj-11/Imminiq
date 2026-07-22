import type { DifficultyLevel } from '../value-objects/difficulty-level.vo';
import type { MockTestCodingDetails } from '../value-objects/mock-test-coding.vo';
import type { QuestionType } from '../value-objects/question-type.vo';

export type MockTestQuestionEntityProps = {
  bankId?: number;
  _id: string;
  testId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: DifficultyLevel;
  order: number;
  points: number;
  coding?: MockTestCodingDetails;
  version?: number;
};

export class MockTestQuestionEntity {
  readonly bankId?: number;
  readonly _id: string;
  readonly testId: string;
  readonly type: QuestionType;
  readonly question: string;
  readonly options?: string[];
  readonly correctAnswer?: string;
  readonly explanation?: string;
  readonly difficulty: DifficultyLevel;
  readonly order: number;
  readonly points: number;
  readonly coding?: MockTestCodingDetails;
  readonly version: number;

  constructor(props: MockTestQuestionEntityProps) {
    this.bankId = props.bankId;
    this._id = props._id;
    this.testId = props.testId;
    this.type = props.type;
    this.question = props.question;
    this.options = props.options;
    this.correctAnswer = props.correctAnswer;
    this.explanation = props.explanation;
    this.difficulty = props.difficulty;
    this.order = props.order;
    this.points = props.points;
    this.coding = props.coding;
    this.version = props.version ?? 1;
  }
}
