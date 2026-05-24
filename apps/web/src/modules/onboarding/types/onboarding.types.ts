import type { ReactNode } from 'react'
import type { OnboardingLevel } from '../../dashboard/hooks/useSaveOnboardingStepTwo'
import type { RoadmapSubtopic } from '../../dashboard/hooks/useRoadmapJobResult'

export type PreviewItem = [string, string]

export type PendingAction = 'draft' | 'continue' | null

export type Level = OnboardingLevel

export type LevelOption = {
  value: Level
  badge: string
  title: string
  description: string
}

export type Section = {
  id: string
  title: string
  items: RoadmapSubtopic[]
}

export type JobTerminalState = 'completed' | 'failed' | null

export type ProgressStepState = 'done' | 'active' | 'pending'

export interface JobStatusApiData {
  jobId?: string
  status?: string
  state?: string
  progress?: number
  progressPercent?: number
  percentage?: number
  currentStep?: number
  step?: number
  completedSteps?: number
  completedStep?: number
  totalSteps?: number
  stepLabel?: string
  currentStepLabel?: string
  progressLabel?: string
  message?: string
  logMessage?: string
  engineLabel?: string
  nextLabel?: string
  nextStep?: string
}

export interface NormalizedJobStatus {
  progress: number
  activeStepIndex: number
  terminalState: JobTerminalState
  logMessage: string
  engineLabel: string
  nextLabel: string
  stepsLabel: string
  activeActivityIndex: number
}

export type GenerationStep = {
  label: string
  activeLabel?: string
}

export type EvaluationStep = {
  label: string
  activeLabel?: string
}

export type ActivityChip = {
  label: string
  icon: ReactNode
}
