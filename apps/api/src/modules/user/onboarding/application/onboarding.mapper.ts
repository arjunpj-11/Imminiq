import type { AIGenerationJobEntity } from '../domain/entities/ai-generation-job.entity';
import type { AIGenerationStepEntity } from '../domain/entities/ai-generation-step.entity';
import type { OnboardingResponseEntity } from '../domain/entities/onboarding-response.entity';
import type {
  RoadmapSubtopicNodeEntity,
  RoadmapTopicNodeEntity,
  RoadmapTreeEntity,
} from '../domain/entities/roadmap-tree.entity';
import type {
  IGetJobStatusResultDTO,
  IOnboardingResponseRecordDTO,
  IOnboardingStatusResultDTO,
  IRoadmapTopicTreeNodeDTO,
  IRoadmapTreeResultDTO,
  ISubtopicTreeNodeDTO,
  ITrackerRecordDTO,
} from './onboarding.dto';

export interface IOnboardingMapper {
  toResponseDto(response: OnboardingResponseEntity | null): IOnboardingResponseRecordDTO | null;

  toStatusDto(response: OnboardingResponseEntity | null): IOnboardingStatusResultDTO;

  toJobStatusDto(
    job: AIGenerationJobEntity,
    steps: AIGenerationStepEntity[],
    trackerId: string | null,
    testId: string | null
  ): IGetJobStatusResultDTO;

  toRoadmapTreeDto(tree: RoadmapTreeEntity): IRoadmapTreeResultDTO;
}

export class OnboardingMapper implements IOnboardingMapper {
  toResponseDto(response: OnboardingResponseEntity | null): IOnboardingResponseRecordDTO | null {
    if (!response) return null;

    return {
      ...(response.id ? { _id: response.id } : {}),
      ...(response.userId ? { userId: response.userId } : {}),
      isCompleted: response.isCompleted,
      ...(response.preparingFor ? { preparingFor: response.preparingFor } : {}),
      ...(response.goal ? { goal: response.goal } : {}),
      ...(response.currentLevel ? { currentLevel: response.currentLevel } : {}),
      completedStep: response.completedStep,
      ...(response.createdAt ? { createdAt: response.createdAt } : {}),
      ...(response.updatedAt ? { updatedAt: response.updatedAt } : {}),
    };
  }

  toStatusDto(response: OnboardingResponseEntity | null): IOnboardingStatusResultDTO {
    return {
      isCompleted: response?.isCompleted ?? false,
      step1Completed: Boolean(response?.preparingFor),
      step2Completed: Boolean(response?.currentLevel),
      completedStep: response?.completedStep ?? 0,
      data: this.toResponseDto(response),
    };
  }

  toJobStatusDto(
    job: AIGenerationJobEntity,
    steps: AIGenerationStepEntity[],
    trackerId: string | null,
    testId: string | null
  ): IGetJobStatusResultDTO {
    const activeStep =
      steps.find((step) => step.status === 'active') ??
      steps.find((step) => step.stepNumber === job.currentStep);

    const completedSteps = steps.filter((step) => step.status === 'completed').length;

    return {
      jobId: job.id,
      jobType: job.jobType,
      status: job.status,
      currentStepNumber: job.currentStep,
      currentStep: activeStep?.stepLabel ?? (job.status === 'completed' ? 'Complete' : 'Queued'),
      completedSteps,
      totalSteps: job.totalSteps,
      steps: steps.map((step) => ({
        stepNumber: step.stepNumber,
        stepLabel: step.stepLabel,
        status: step.status,
        startedAt: step.startedAt,
        completedAt: step.completedAt,
      })),
      trackerId,
      testId,
      errorMessage: job.errorMessage ?? null,
    };
  }

  toRoadmapTreeDto(tree: RoadmapTreeEntity): IRoadmapTreeResultDTO {
    return {
      tracker: tree.tracker ? this.toTrackerRecord(tree.tracker.id, tree.tracker.attributes) : null,
      topics: tree.topics.map((topic) => this.toTopicDto(topic)),
    };
  }

  private toTrackerRecord(id: string, rawData: Record<string, unknown>): ITrackerRecordDTO {
    return {
      ...rawData,
      _id: id,
    };
  }

  private toTopicDto(topic: RoadmapTopicNodeEntity): IRoadmapTopicTreeNodeDTO {
    return {
      _id: topic.id,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      children: topic.children.map((child) => this.toSubtopicDto(child)),
    };
  }

  private toSubtopicDto(subtopic: RoadmapSubtopicNodeEntity): ISubtopicTreeNodeDTO {
    return {
      _id: subtopic.id,
      title: subtopic.title,
      description: subtopic.description,
      order: subtopic.order,
      depth: subtopic.depth,
      children: subtopic.children.map((child) => this.toSubtopicDto(child)),
    };
  }
}
