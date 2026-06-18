import type { AIGenerationJobStatus } from '../value-objects/ai-generation-job-status.vo'
import type { AIGenerationJobType } from '../value-objects/ai-generation-job-type.vo'

export type AIGenerationJobEntityProps = {
  id: string
  userId: string
  jobType: AIGenerationJobType
  status: AIGenerationJobStatus
  currentStep: number
  totalSteps: number
  outputData?: Record<string, unknown>
  errorMessage?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export class AIGenerationJobEntity {
  readonly id: string
  readonly userId: string
  readonly jobType: AIGenerationJobType
  readonly status: AIGenerationJobStatus
  readonly currentStep: number
  readonly totalSteps: number
  readonly outputData: Record<string, unknown> | undefined
  readonly errorMessage: string | null | undefined
  readonly createdAt: Date | undefined
  readonly updatedAt: Date | undefined

  constructor(props: AIGenerationJobEntityProps) {
    this.id = props.id
    this.userId = props.userId
    this.jobType = props.jobType
    this.status = props.status
    this.currentStep = props.currentStep
    this.totalSteps = props.totalSteps
    this.outputData = props.outputData
    this.errorMessage = props.errorMessage
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  belongsTo(userId: string): boolean {
    return this.userId === userId
  }

  isRoadmapJob(): boolean {
    return this.jobType === 'roadmap'
  }

  isEvaluationJob(): boolean {
    return this.jobType === 'evaluation'
  }

  isCompleted(): boolean {
    return this.status === 'completed'
  }
}
