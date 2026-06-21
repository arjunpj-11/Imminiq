import type { AIGenerationStepStatus } from '../value-objects/ai-generation-step-status.vo'

export type AIGenerationStepEntityProps = {
  id?: string
  jobId?: string
  stepNumber: number
  stepLabel: string
  status: AIGenerationStepStatus
  startedAt?: Date | null
  completedAt?: Date | null
}

export class AIGenerationStepEntity {
  readonly id: string | undefined
  readonly jobId: string | undefined
  readonly stepNumber: number
  readonly stepLabel: string
  readonly status: AIGenerationStepStatus
  readonly startedAt: Date | null
  readonly completedAt: Date | null

  constructor(props: AIGenerationStepEntityProps) {
    this.id = props.id
    this.jobId = props.jobId
    this.stepNumber = props.stepNumber
    this.stepLabel = props.stepLabel
    this.status = props.status
    this.startedAt = props.startedAt ?? null
    this.completedAt = props.completedAt ?? null
  }
}
