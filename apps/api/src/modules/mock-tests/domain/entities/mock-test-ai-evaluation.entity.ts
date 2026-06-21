import type { EvaluationStatus } from '../value-objects/evaluation-status.vo'

export type MockTestAIEvaluationEntityProps = {
  _id: string
  attemptId: string
  questionId: string
  answerId: string
  score: number
  maxScore: number
  feedback: string
  status: EvaluationStatus
  createdAt: Date
}

export class MockTestAIEvaluationEntity {
  readonly _id: string
  readonly attemptId: string
  readonly questionId: string
  readonly answerId: string
  readonly score: number
  readonly maxScore: number
  readonly feedback: string
  readonly status: EvaluationStatus
  readonly createdAt: Date

  constructor(props: MockTestAIEvaluationEntityProps) {
    this._id = props._id
    this.attemptId = props.attemptId
    this.questionId = props.questionId
    this.answerId = props.answerId
    this.score = props.score
    this.maxScore = props.maxScore
    this.feedback = props.feedback
    this.status = props.status
    this.createdAt = props.createdAt
  }
}
