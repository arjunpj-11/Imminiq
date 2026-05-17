export type RoadmapLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

export type RoadmapJobInput = {
  topic: string
  goal?: string
  level: RoadmapLevel
}

export type EvaluationJobInput = {
  sourceRoadmapJobId: string
  trackerId: string
}

export type AIGenerationJobType = 'roadmap' | 'evaluation'

export type AIGenerationJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | string

export type AIGenerationStepStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | string

export type OutputDataRecord = Record<string, unknown> | undefined

export interface OnboardingResponseRecord {
  isCompleted?: boolean
  preparingFor?: string
  currentLevel?: RoadmapLevel
  completedStep?: number
  [key: string]: unknown
}

export interface AIGenerationJobRecord {
  _id: {
    toString(): string
  }
  userId: {
    toString(): string
  }
  jobType: AIGenerationJobType | string
  status: AIGenerationJobStatus
  currentStep: number
  totalSteps: number
  outputData?: Record<string, unknown>
  errorMessage?: string | null
}

export interface AIGenerationStepRecord {
  stepNumber: number
  stepLabel: string
  status: AIGenerationStepStatus
  startedAt?: Date | null
  completedAt?: Date | null
}

export interface TrackerRecord {
  _id?: {
    toString(): string
  }
  [key: string]: unknown
}

export type SubtopicTreeNode = {
  _id: string
  title: string
  description: string
  order: number
  depth: number
  children: SubtopicTreeNode[]
}

export type RoadmapTopicTreeNode = {
  _id: string
  title: string
  description: string
  order: number
  children: SubtopicTreeNode[]
}

export interface RoadmapTreeResult {
  tracker: TrackerRecord | null
  topics: RoadmapTopicTreeNode[]
}

export interface OnboardingStatusResult {
  isCompleted: boolean
  step1Completed: boolean
  step2Completed: boolean
  completedStep: number
  data: OnboardingResponseRecord | null
}

export interface GenerateRoadmapResult {
  jobId: string
}

export interface GetJobStatusResult {
  jobId: string
  jobType: string
  status: string
  currentStepNumber: number
  currentStep: string
  completedSteps: number
  totalSteps: number
  steps: Array<{
    stepNumber: number
    stepLabel: string
    status: string
    startedAt: Date | null
    completedAt: Date | null
  }>
  trackerId: string | null
  errorMessage: string | null
}

export interface GetEvaluationResult {
  jobId: string
  trackerId: string | null
  evaluation: Record<string, unknown>
}
