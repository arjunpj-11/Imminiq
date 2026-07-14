import type { AIGenerationJobStatus } from '../domain/value-objects/ai-generation-job-status.vo';
import type { AIGenerationJobType } from '../domain/value-objects/ai-generation-job-type.vo';
import type { AIGenerationStepStatus } from '../domain/value-objects/ai-generation-step-status.vo';
import type { RoadmapLevel } from '../domain/value-objects/roadmap-level.vo';
import type { TrackerIntakeProfile } from '../domain/services/tracker-intake-agent.interface';

export interface SaveOnboardingStepOnePayloadDTO {
  topic: string;
  goal?: string;
}

export interface SaveOnboardingStepTwoPayloadDTO {
  level: RoadmapLevel;
}

export interface GenerateRoadmapPayloadDTO {
  topic: string;
  goal?: string;
  level: RoadmapLevel;
}

export interface OnboardingResponseRecordDTO {
  _id?: string;
  userId?: string;
  isCompleted?: boolean;
  preparingFor?: string;
  goal?: string;
  currentLevel?: RoadmapLevel;
  completedStep?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export interface OnboardingStatusResultDTO {
  isCompleted: boolean;
  step1Completed: boolean;
  step2Completed: boolean;
  completedStep: number;
  data: OnboardingResponseRecordDTO | null;
}

export interface GenerateRoadmapResultDTO {
  jobId: string;
}

export interface AIGenerationStepResultDTO {
  stepNumber: number;
  stepLabel: string;
  status: AIGenerationStepStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface GetJobStatusResultDTO {
  jobId: string;
  jobType: AIGenerationJobType;
  status: AIGenerationJobStatus;
  currentStepNumber: number;
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  steps: AIGenerationStepResultDTO[];
  trackerId: string | null;
  testId: string | null;
  errorMessage: string | null;
}

export interface TrackerRecordDTO {
  _id: string;
  [key: string]: unknown;
}

export interface SubtopicTreeNodeDTO {
  _id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  children: SubtopicTreeNodeDTO[];
}

export interface RoadmapTopicTreeNodeDTO {
  _id: string;
  title: string;
  description: string;
  order: number;
  children: SubtopicTreeNodeDTO[];
}

export interface RoadmapTreeResultDTO {
  tracker: TrackerRecordDTO | null;
  topics: RoadmapTopicTreeNodeDTO[];
}

export interface GetEvaluationResultDTO {
  jobId: string;
  trackerId: string | null;
  evaluation: Record<string, unknown>;
}

export type OnboardingResponseDTO = OnboardingResponseRecordDTO;
export type OnboardingStatusDTO = OnboardingStatusResultDTO;
export type GenerateRoadmapDTO = GenerateRoadmapResultDTO;
export type RoadmapJobStatusDTO = GetJobStatusResultDTO;
export type RoadmapTreeDTO = RoadmapTreeResultDTO;
export type RoadmapEvaluationDTO = GetEvaluationResultDTO;
export interface TrackerIntakeResponseDTO {
  assistantMessage: string;
  isComplete: boolean;
  profile?: TrackerIntakeProfile;
}
