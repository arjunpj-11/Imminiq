import type { AIGenerationJobStatus } from '../../domain/value-objects/ai-generation-job-status.vo'
import type { AIGenerationJobType } from '../../domain/value-objects/ai-generation-job-type.vo'
import type { AIGenerationStepStatus } from '../../domain/value-objects/ai-generation-step-status.vo'
import type { RoadmapLevel } from '../../domain/value-objects/roadmap-level.vo'

export interface SaveOnboardingStepOnePayload {
  topic: string
  goal?: string
}

export interface SaveOnboardingStepTwoPayload {
  level: RoadmapLevel
}

export interface GenerateRoadmapPayload {
  topic: string
  goal?: string
  level: RoadmapLevel
}

export interface OnboardingResponseRecord {
  _id?: string
  userId?: string
  isCompleted?: boolean
  preparingFor?: string
  goal?: string
  currentLevel?: RoadmapLevel
  completedStep?: number
  createdAt?: Date
  updatedAt?: Date
  [key: string]: unknown
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

export interface AIGenerationStepResult {
  stepNumber: number
  stepLabel: string
  status: AIGenerationStepStatus
  startedAt: Date | null
  completedAt: Date | null
}

export interface GetJobStatusResult {
  jobId: string
  jobType: AIGenerationJobType
  status: AIGenerationJobStatus
  currentStepNumber: number
  currentStep: string
  completedSteps: number
  totalSteps: number
  steps: AIGenerationStepResult[]
  trackerId: string | null
  errorMessage: string | null
}

export interface TrackerRecord {
  _id: string
  [key: string]: unknown
}

export interface SubtopicTreeNode {
  _id: string
  title: string
  description: string
  order: number
  depth: number
  children: SubtopicTreeNode[]
}

export interface RoadmapTopicTreeNode {
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

export interface GetEvaluationResult {
  jobId: string
  trackerId: string | null
  evaluation: Record<string, unknown>
}

export type OnboardingResponseDto = OnboardingResponseRecord
export type OnboardingStatusDto = OnboardingStatusResult
export type GenerateRoadmapDto = GenerateRoadmapResult
export type RoadmapJobStatusDto = GetJobStatusResult
export type RoadmapTreeDto = RoadmapTreeResult
export type RoadmapEvaluationDto = GetEvaluationResult
