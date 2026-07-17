import type { AIGenerationJobStatus } from '../domain/value-objects/ai-generation-job-status.vo';
import type { AIGenerationJobType } from '../domain/value-objects/ai-generation-job-type.vo';
import type { AIGenerationStepStatus } from '../domain/value-objects/ai-generation-step-status.vo';
import type { RoadmapLevel } from '../domain/value-objects/roadmap-level.vo';
import type { TrackerIntakeProfile } from '../domain/services/tracker-intake-agent.interface';

export interface SaveTrackerCreationStepOnePayloadDTO {
  topic: string;
  goal?: string;
  preferredLanguage: string;
}

export interface SaveTrackerCreationStepTwoPayloadDTO {
  level: RoadmapLevel;
}

export interface GenerateRoadmapPayloadDTO {
  topic: string;
  goal?: string;
  level: RoadmapLevel;
  preferredLanguage: string;
}

export interface TrackerCreationResponseRecordDTO {
  _id?: string;
  userId?: string;
  isCompleted?: boolean;
  preparingFor?: string;
  goal?: string;
  preferredLanguage?: string;
  currentLevel?: RoadmapLevel;
  completedStep?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export interface TrackerCreationStatusResultDTO {
  isCompleted: boolean;
  step1Completed: boolean;
  step2Completed: boolean;
  completedStep: number;
  data: TrackerCreationResponseRecordDTO | null;
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

export type TrackerCreationResponseDTO = TrackerCreationResponseRecordDTO;
export type TrackerCreationStatusDTO = TrackerCreationStatusResultDTO;
export type GenerateRoadmapDTO = GenerateRoadmapResultDTO;
export type RoadmapJobStatusDTO = GetJobStatusResultDTO;
export type RoadmapTreeDTO = RoadmapTreeResultDTO;
export type RoadmapEvaluationDTO = GetEvaluationResultDTO;
export interface TrackerIntakeResponseDTO {
  assistantMessage: string;
  isComplete: boolean;
  profile?: TrackerIntakeProfile;
}
