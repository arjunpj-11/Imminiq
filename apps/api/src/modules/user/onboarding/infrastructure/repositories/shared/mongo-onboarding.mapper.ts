import { AIGenerationJobEntity } from '../../../domain/entities/ai-generation-job.entity';
import { AIGenerationStepEntity } from '../../../domain/entities/ai-generation-step.entity';
import { OnboardingResponseEntity } from '../../../domain/entities/onboarding-response.entity';
import {
  RoadmapSubtopicNodeEntity,
  RoadmapTopicNodeEntity,
  RoadmapTrackerEntity,
  RoadmapTreeEntity,
} from '../../../domain/entities/roadmap-tree.entity';
import { OnboardingDomainError } from '../../../domain/onboarding-domain.error';
import type { AIGenerationJobStatus } from '../../../domain/value-objects/ai-generation-job-status.vo';
import type { AIGenerationJobType } from '../../../domain/value-objects/ai-generation-job-type.vo';
import type { AIGenerationStepStatus } from '../../../domain/value-objects/ai-generation-step-status.vo';
import type { RoadmapLevel } from '../../../domain/value-objects/roadmap-level.vo';
import type {
  MaybeMongooseDocument,
  MongoAIGenerationJobRecord,
  MongoAIGenerationStepRecord,
  MongoIdLike,
  MongoOnboardingResponseRecord,
  MongoRoadmapSubtopicRecord,
  MongoRoadmapTopicRecord,
  MongoTrackerRecord,
} from './mongo-onboarding.types';

export class MongoOnboardingMapper {
  toPlainRecord<T>(value: MaybeMongooseDocument<T>): T {
    return typeof value.toObject === 'function' ? value.toObject() : value;
  }

  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString();
  }

  toOptionalId(value: MongoIdLike | string | undefined): string | undefined {
    return value ? this.toId(value) : undefined;
  }

  toOnboardingResponseEntity(
    response: MongoOnboardingResponseRecord | null
  ): OnboardingResponseEntity | null {
    if (!response) {
      return null;
    }

    const id = this.toOptionalId(response._id);
    const userId = this.toOptionalId(response.userId);
    const currentLevel = this.toRoadmapLevel(response.currentLevel);

    return new OnboardingResponseEntity({
      ...(id ? { id } : {}),
      ...(userId ? { userId } : {}),
      ...(typeof response.isCompleted === 'boolean' ? { isCompleted: response.isCompleted } : {}),
      ...(response.preparingFor ? { preparingFor: response.preparingFor } : {}),
      ...(response.goal ? { goal: response.goal } : {}),
      ...(currentLevel ? { currentLevel } : {}),
      ...(typeof response.completedStep === 'number'
        ? { completedStep: response.completedStep }
        : {}),
      ...(response.createdAt ? { createdAt: response.createdAt } : {}),
      ...(response.updatedAt ? { updatedAt: response.updatedAt } : {}),
    });
  }

  toAIJobEntity(job: MongoAIGenerationJobRecord | null): AIGenerationJobEntity | null {
    if (!job) {
      return null;
    }

    return new AIGenerationJobEntity({
      id: this.toId(job._id),
      userId: this.toId(job.userId),
      jobType: this.toAIJobType(job.jobType),
      status: this.toAIJobStatus(job.status),
      currentStep: job.currentStep,
      totalSteps: job.totalSteps,
      ...(job.outputData ? { outputData: job.outputData } : {}),
      ...(job.errorMessage ? { errorMessage: job.errorMessage } : {}),
      ...(job.createdAt ? { createdAt: job.createdAt } : {}),
      ...(job.updatedAt ? { updatedAt: job.updatedAt } : {}),
    });
  }

  toAIJobEntityOrThrow(job: MongoAIGenerationJobRecord | null): AIGenerationJobEntity {
    const entity = this.toAIJobEntity(job);

    if (!entity) {
      throw new OnboardingDomainError('AI_JOB_MAPPING_FAILED', 'Failed to map AI generation job');
    }

    return entity;
  }

  toAIJobStepEntity(step: MongoAIGenerationStepRecord): AIGenerationStepEntity {
    const id = this.toOptionalId(step._id);
    const jobId = this.toOptionalId(step.jobId);

    return new AIGenerationStepEntity({
      ...(id ? { id } : {}),
      ...(jobId ? { jobId } : {}),
      stepNumber: step.stepNumber,
      stepLabel: step.stepLabel,
      status: this.toAIJobStepStatus(step.status),
      ...(step.startedAt ? { startedAt: step.startedAt } : {}),
      ...(step.completedAt ? { completedAt: step.completedAt } : {}),
    });
  }

  toRoadmapTreeEntity(input: {
    tracker: MongoTrackerRecord | null;
    topics: MongoRoadmapTopicRecord[];
    subtopics: MongoRoadmapSubtopicRecord[];
  }): RoadmapTreeEntity {
    const { tracker, topics, subtopics } = input;
    const subtopicMap = new Map<string, RoadmapSubtopicNodeEntity>();

    for (const subtopic of subtopics) {
      subtopicMap.set(
        this.toId(subtopic._id),
        new RoadmapSubtopicNodeEntity({
          id: this.toId(subtopic._id),
          title: subtopic.title,
          description: subtopic.description,
          order: subtopic.order,
          depth: subtopic.depth,
          children: [],
        })
      );
    }

    const topicChildrenMap = new Map<string, RoadmapSubtopicNodeEntity[]>();

    for (const topic of topics) {
      topicChildrenMap.set(this.toId(topic._id), []);
    }

    for (const subtopic of subtopics) {
      const currentNode = subtopicMap.get(this.toId(subtopic._id));

      if (!currentNode) {
        continue;
      }

      if (subtopic.parentSubtopicId) {
        const parentNode = subtopicMap.get(this.toId(subtopic.parentSubtopicId));

        if (parentNode) {
          parentNode.children.push(currentNode);
        }

        continue;
      }

      const rootChildren = topicChildrenMap.get(this.toId(subtopic.topicId));

      if (rootChildren) {
        rootChildren.push(currentNode);
      }
    }

    const roadmapTopics = topics.map(
      (topic) =>
        new RoadmapTopicNodeEntity({
          id: this.toId(topic._id),
          title: topic.title,
          description: topic.description,
          order: topic.order,
          children: topicChildrenMap.get(this.toId(topic._id)) ?? [],
        })
    );

    return new RoadmapTreeEntity({
      tracker: tracker?._id
        ? new RoadmapTrackerEntity({
            id: this.toId(tracker._id),
            attributes: this.toTrackerAttributes(tracker),
          })
        : null,
      topics: roadmapTopics,
    });
  }

  private toTrackerAttributes(tracker: MongoTrackerRecord): Record<string, unknown> {
    const attributes: Record<string, unknown> = { ...tracker };
    delete attributes._id;

    return attributes;
  }

  private toRoadmapLevel(value: string | undefined): RoadmapLevel | undefined {
    if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
      return value;
    }

    return undefined;
  }

  private toAIJobType(value: string): AIGenerationJobType {
    if (value === 'roadmap' || value === 'evaluation') {
      return value;
    }

    throw new OnboardingDomainError('INVALID_AI_JOB_TYPE', 'Stored AI job type is invalid');
  }

  private toAIJobStatus(value: string): AIGenerationJobStatus {
    if (
      value === 'pending' ||
      value === 'processing' ||
      value === 'completed' ||
      value === 'failed'
    ) {
      return value;
    }

    throw new OnboardingDomainError('INVALID_AI_JOB_STATUS', 'Stored AI job status is invalid');
  }

  private toAIJobStepStatus(value: string): AIGenerationStepStatus {
    if (value === 'pending' || value === 'active' || value === 'completed' || value === 'failed') {
      return value;
    }

    throw new OnboardingDomainError(
      'INVALID_AI_JOB_STEP_STATUS',
      'Stored AI job step status is invalid'
    );
  }
}
