import type { AIGenerationJobStatus } from '../domain/value-objects/ai-generation-job-status.vo';
import type { AIGenerationJobType } from '../domain/value-objects/ai-generation-job-type.vo';
import type { AIGenerationStepStatus } from '../domain/value-objects/ai-generation-step-status.vo';
import type { RoadmapLevel } from '../domain/value-objects/roadmap-level.vo';
import type { TrackerIntakeProfile } from '../domain/services/tracker-intake-agent.interface';

export interface ISaveOnboardingStepOnePayloadDTO {
  topic: string;
  goal?: string;
}

export interface ISaveOnboardingStepTwoPayloadDTO {
  level: RoadmapLevel;
}

export interface IGenerateRoadmapPayloadDTO {
  topic: string;
  goal?: string;
  level: RoadmapLevel;
}

export interface IOnboardingResponseRecordDTO {
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

export interface IOnboardingStatusResultDTO {
  isCompleted: boolean;
  step1Completed: boolean;
  step2Completed: boolean;
  completedStep: number;
  data: IOnboardingResponseRecordDTO | null;
}

export interface IGenerateRoadmapResultDTO {
  jobId: string;
}

export interface IAIGenerationStepResultDTO {
  stepNumber: number;
  stepLabel: string;
  status: AIGenerationStepStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface IGetJobStatusResultDTO {
  jobId: string;
  jobType: AIGenerationJobType;
  status: AIGenerationJobStatus;
  currentStepNumber: number;
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  steps: IAIGenerationStepResultDTO[];
  trackerId: string | null;
  testId: string | null;
  errorMessage: string | null;
}

export interface ITrackerRecordDTO {
  _id: string;
  [key: string]: unknown;
}

export interface ISubtopicTreeNodeDTO {
  _id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  children: ISubtopicTreeNodeDTO[];
}

export interface IRoadmapTopicTreeNodeDTO {
  _id: string;
  title: string;
  description: string;
  order: number;
  children: ISubtopicTreeNodeDTO[];
}

export interface IRoadmapTreeResultDTO {
  tracker: ITrackerRecordDTO | null;
  topics: IRoadmapTopicTreeNodeDTO[];
}

export interface IGetEvaluationResultDTO {
  jobId: string;
  trackerId: string | null;
  evaluation: Record<string, unknown>;
}

export type OnboardingResponseDTO = IOnboardingResponseRecordDTO;
export type OnboardingStatusDTO = IOnboardingStatusResultDTO;
export type GenerateRoadmapDTO = IGenerateRoadmapResultDTO;
export type RoadmapJobStatusDTO = IGetJobStatusResultDTO;
export type RoadmapTreeDTO = IRoadmapTreeResultDTO;
export type RoadmapEvaluationDTO = IGetEvaluationResultDTO;
export interface ITrackerIntakeResponseDTO {
  assistantMessage: string;
  isComplete: boolean;
  profile?: TrackerIntakeProfile;
}
