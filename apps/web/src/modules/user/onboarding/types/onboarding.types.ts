import type { ReactNode } from 'react'
import type { OnboardingLevel } from '../hooks/useSaveOnboardingStepTwo'
import type { IRoadmapSubtopic } from '../hooks/useRoadmapJobResult'

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
  items: IRoadmapSubtopic[]
}

export type JobTerminalState = 'completed' | 'failed' | null

export type ProgressStepState = 'done' | 'active' | 'pending'

export interface ITrackerIntakeMessage {
  role: 'assistant' | 'user'
  content: string
}

export interface ITrackerIntakeProfile {
  topic: string
  motivation: string
  desiredOutcome: string
  currentExperience: string
  weeklyTimeCommitment: string
  learningPreferences: string[]
  constraints: string[]
  inferredLevel: Level
}

export interface IJobStatusApiData {
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

export interface INormalizedJobStatus {
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
