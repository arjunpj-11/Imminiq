export type MockTestAnswerEntityProps = {
  _id: string
  attemptId: string
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned?: number
  aiEvaluationId?: string
  submittedAt: Date
}

export class MockTestAnswerEntity {
  readonly _id: string
  readonly attemptId: string
  readonly questionId: string
  readonly answer: string
  readonly isCorrect?: boolean
  readonly pointsEarned?: number
  readonly aiEvaluationId?: string
  readonly submittedAt: Date

  constructor(props: MockTestAnswerEntityProps) {
    this._id = props._id
    this.attemptId = props.attemptId
    this.questionId = props.questionId
    this.answer = props.answer
    this.isCorrect = props.isCorrect
    this.pointsEarned = props.pointsEarned
    this.aiEvaluationId = props.aiEvaluationId
    this.submittedAt = props.submittedAt
  }
}
