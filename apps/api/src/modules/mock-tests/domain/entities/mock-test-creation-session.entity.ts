import type { CreationSessionStatus } from '../value-objects/creation-session-status.vo'
import type { MockTestCreationDraft } from '../value-objects/mock-test-creation-draft.vo'

export type MockTestCreationSessionEntityProps = {
  _id: string
  userId: string
  status: CreationSessionStatus
  step: number
  draftData: MockTestCreationDraft
  createdAt: Date
  updatedAt: Date
}

export class MockTestCreationSessionEntity {
  readonly _id: string
  readonly userId: string
  readonly status: CreationSessionStatus
  readonly step: number
  readonly draftData: MockTestCreationDraft
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: MockTestCreationSessionEntityProps) {
    this._id = props._id
    this.userId = props.userId
    this.status = props.status
    this.step = props.step
    this.draftData = props.draftData
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
