import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'
import { AIGenerationStep } from '../../../../infrastructure/database/models/ai-generation-step.model'
import { OnboardingResponse } from '../../../../infrastructure/database/models/onboarding-response.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import {
  ROADMAP_EVALUATION_TOTAL_STEPS,
  ROADMAP_GENERATION_TOTAL_STEPS,
} from '../../domain/constants/onboarding.constants'
import { AIGenerationJobEntity } from '../../domain/entities/ai-generation-job.entity'
import { AIGenerationStepEntity } from '../../domain/entities/ai-generation-step.entity'
import { OnboardingResponseEntity } from '../../domain/entities/onboarding-response.entity'
import {
  RoadmapSubtopicNodeEntity,
  RoadmapTopicNodeEntity,
  RoadmapTrackerEntity,
  RoadmapTreeEntity,
} from '../../domain/entities/roadmap-tree.entity'
import { OnboardingDomainError } from '../../domain/errors/onboarding-domain.error'
import type {
  EvaluationJobInput,
  RoadmapJobInput,
} from '../../domain/repositories/onboarding-ai-job-command.repository.interface'
import type { OnboardingRepositoryContract } from '../../domain/repositories/onboarding.repository.interface'
import type { AIGenerationJobStatus } from '../../domain/value-objects/ai-generation-job-status.vo'
import type { AIGenerationJobType } from '../../domain/value-objects/ai-generation-job-type.vo'
import type { AIGenerationStepStatus } from '../../domain/value-objects/ai-generation-step-status.vo'
import type { RoadmapLevel } from '../../domain/value-objects/roadmap-level.vo'

type MongoIdLike = {
  toString(): string
}

type MaybeMongooseDocument<T> = T & {
  toObject?: () => T
}

type MongoOnboardingResponseRecord = {
  _id?: MongoIdLike | string
  userId?: MongoIdLike | string
  isCompleted?: boolean
  preparingFor?: string
  goal?: string
  currentLevel?: string
  completedStep?: number
  createdAt?: Date
  updatedAt?: Date
  [key: string]: unknown
}

type MongoAIGenerationJobRecord = {
  _id: MongoIdLike | string
  userId: MongoIdLike | string
  jobType: string
  status: string
  currentStep: number
  totalSteps: number
  outputData?: Record<string, unknown>
  errorMessage?: string | null
  createdAt?: Date
  updatedAt?: Date
}

type MongoAIGenerationStepRecord = {
  _id?: MongoIdLike | string
  jobId?: MongoIdLike | string
  stepNumber: number
  stepLabel: string
  status: string
  startedAt?: Date | null
  completedAt?: Date | null
}

type MongoRoadmapTopicRecord = {
  _id: MongoIdLike | string
  title: string
  description: string
  order: number
}

type MongoRoadmapSubtopicRecord = {
  _id: MongoIdLike | string
  topicId: MongoIdLike | string
  parentSubtopicId?: MongoIdLike | string | null
  title: string
  description: string
  order: number
  depth: number
}

type MongoTrackerRecord = {
  _id?: MongoIdLike | string
  [key: string]: unknown
}

export class MongoOnboardingRepository implements OnboardingRepositoryContract {
  async getStatus(userId: string): Promise<OnboardingResponseEntity | null> {
    return this.runPersistence('ONBOARDING_STATUS_QUERY_FAILED', async () => {
      const response = await OnboardingResponse.findOne({
        userId,
        deletedAt: null,
      }).lean<MongoOnboardingResponseRecord>()

      return this.toOnboardingResponseEntity(response)
    })
  }

  async saveStep1(
    userId: string,
    topic: string,
    goal?: string,
  ): Promise<OnboardingResponseEntity | null> {
    return this.runPersistence('ONBOARDING_STEP_ONE_SAVE_FAILED', async () => {
      const response = await OnboardingResponse.findOneAndUpdate(
        { userId },
        {
          $set: {
            preparingFor: topic,
            goal: goal ?? '',
          },
          $max: {
            completedStep: 1,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      ).lean<MongoOnboardingResponseRecord>()

      return this.toOnboardingResponseEntity(response)
    })
  }

  async saveStep2(
    userId: string,
    level: RoadmapLevel,
  ): Promise<OnboardingResponseEntity | null> {
    return this.runPersistence('ONBOARDING_STEP_TWO_SAVE_FAILED', async () => {
      const response = await OnboardingResponse.findOneAndUpdate(
        { userId },
        {
          $set: {
            currentLevel: level,
          },
          $max: {
            completedStep: 2,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      ).lean<MongoOnboardingResponseRecord>()

      return this.toOnboardingResponseEntity(response)
    })
  }

  async markCompleted(
    userId: string,
  ): Promise<OnboardingResponseEntity | null> {
    return this.runPersistence('ONBOARDING_COMPLETION_SAVE_FAILED', async () => {
      const response = await OnboardingResponse.findOneAndUpdate(
        { userId },
        {
          $set: {
            isCompleted: true,
            completedStep: 2,
          },
        },
        { new: true },
      ).lean<MongoOnboardingResponseRecord>()

      return this.toOnboardingResponseEntity(response)
    })
  }

  async findActiveRoadmapJobForUser(
    userId: string,
  ): Promise<AIGenerationJobEntity | null> {
    return this.runPersistence('ACTIVE_ROADMAP_JOB_QUERY_FAILED', async () => {
      const job = await AIGenerationJob.findOne({
        userId,
        jobType: 'roadmap',
        status: { $in: ['pending', 'processing'] },
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean<MongoAIGenerationJobRecord>()

      return this.toAIJobEntity(job)
    })
  }

  async findActiveEvaluationJobForRoadmap(
    userId: string,
    sourceRoadmapJobId: string,
  ): Promise<AIGenerationJobEntity | null> {
    return this.runPersistence(
      'ACTIVE_EVALUATION_JOB_QUERY_FAILED',
      async () => {
        const job = await AIGenerationJob.findOne({
          userId,
          jobType: 'evaluation',
          'inputData.sourceRoadmapJobId': sourceRoadmapJobId,
          status: { $in: ['pending', 'processing'] },
          deletedAt: null,
        })
          .sort({ createdAt: -1 })
          .lean<MongoAIGenerationJobRecord>()

        return this.toAIJobEntity(job)
      },
    )
  }

  async createAIJob(
    userId: string,
    inputData: RoadmapJobInput,
  ): Promise<AIGenerationJobEntity> {
    return this.runPersistence('ROADMAP_JOB_CREATE_FAILED', async () => {
      const persistenceInputData: Record<string, unknown> = {
        topic: inputData.topic,
        ...(inputData.goal !== undefined ? { goal: inputData.goal } : {}),
        level: inputData.level,
      }

      const aiJob = await AIGenerationJob.create({
        userId,
        jobType: 'roadmap',
        status: 'pending',
        inputData: persistenceInputData,
        totalSteps: ROADMAP_GENERATION_TOTAL_STEPS,
        currentStep: 0,
      })

      return this.toAIJobEntityOrThrow(
        this.toPlainRecord(
          aiJob as unknown as MaybeMongooseDocument<MongoAIGenerationJobRecord>,
        ),
      )
    })
  }

  async createEvaluationAIJob(
    userId: string,
    inputData: EvaluationJobInput,
  ): Promise<AIGenerationJobEntity> {
    return this.runPersistence('EVALUATION_JOB_CREATE_FAILED', async () => {
      const persistenceInputData: Record<string, unknown> = {
        sourceRoadmapJobId: inputData.sourceRoadmapJobId,
        trackerId: inputData.trackerId,
      }

      const aiJob = await AIGenerationJob.create({
        userId,
        jobType: 'evaluation',
        status: 'pending',
        inputData: persistenceInputData,
        totalSteps: ROADMAP_EVALUATION_TOTAL_STEPS,
        currentStep: 0,
      })

      return this.toAIJobEntityOrThrow(
        this.toPlainRecord(
          aiJob as unknown as MaybeMongooseDocument<MongoAIGenerationJobRecord>,
        ),
      )
    })
  }

  async createAIJobSteps(
    jobId: string,
    stepLabels: readonly string[],
  ): Promise<void> {
    return this.runPersistence('AI_JOB_STEPS_CREATE_FAILED', async () => {
      await AIGenerationStep.insertMany(
        stepLabels.map((stepLabel, index) => ({
          jobId,
          stepNumber: index + 1,
          stepLabel,
          status: 'pending',
        })),
      )
    })
  }

  async getJobById(jobId: string): Promise<AIGenerationJobEntity | null> {
    return this.runPersistence('AI_JOB_QUERY_FAILED', async () => {
      const job = await AIGenerationJob.findById(
        jobId,
      ).lean<MongoAIGenerationJobRecord>()

      return this.toAIJobEntity(job)
    })
  }

  async getJobSteps(jobId: string): Promise<AIGenerationStepEntity[]> {
    return this.runPersistence('AI_JOB_STEPS_QUERY_FAILED', async () => {
      const steps = await AIGenerationStep.find({ jobId })
        .sort({ stepNumber: 1 })
        .lean<MongoAIGenerationStepRecord[]>()

      return steps.map((step) => this.toAIJobStepEntity(step))
    })
  }

  async getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity> {
    return this.runPersistence('ROADMAP_TREE_QUERY_FAILED', async () => {
      const tracker = await Tracker.findById(
        trackerId,
      ).lean<MongoTrackerRecord>()

      const topics = await TrackerTopic.find({
        trackerId,
        deletedAt: null,
      })
        .sort({ order: 1 })
        .lean<MongoRoadmapTopicRecord[]>()

      const subtopics = await TrackerSubtopic.find({
        trackerId,
        deletedAt: null,
      })
        .sort({ depth: 1, order: 1 })
        .lean<MongoRoadmapSubtopicRecord[]>()

      const subtopicMap = new Map<string, RoadmapSubtopicNodeEntity>()

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
          }),
        )
      }

      const topicChildrenMap = new Map<string, RoadmapSubtopicNodeEntity[]>()

      for (const topic of topics) {
        topicChildrenMap.set(this.toId(topic._id), [])
      }

      for (const subtopic of subtopics) {
        const currentNode = subtopicMap.get(this.toId(subtopic._id))

        if (!currentNode) continue

        if (subtopic.parentSubtopicId) {
          const parentNode = subtopicMap.get(
            this.toId(subtopic.parentSubtopicId),
          )

          if (parentNode) {
            parentNode.children.push(currentNode)
          }

          continue
        }

        const rootChildren = topicChildrenMap.get(this.toId(subtopic.topicId))

        if (rootChildren) {
          rootChildren.push(currentNode)
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
          }),
      )

      return new RoadmapTreeEntity({
        tracker: tracker?._id
          ? new RoadmapTrackerEntity({
              id: this.toId(tracker._id),
              attributes: this.toTrackerAttributes(tracker),
            })
          : null,
        topics: roadmapTopics,
      })
    })
  }


  private toTrackerAttributes(
    tracker: MongoTrackerRecord,
  ): Record<string, unknown> {
    const attributes: Record<string, unknown> = { ...tracker }
    delete attributes._id

    return attributes
  }

  private async runPersistence<T>(
    code: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof OnboardingDomainError) {
        throw error
      }

      if (this.isDuplicateKeyError(error)) {
        throw new OnboardingDomainError(
          'DUPLICATE_ONBOARDING_RECORD',
          'Duplicate onboarding record',
        )
      }

      throw new OnboardingDomainError(code, 'Onboarding persistence failed')
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    )
  }

  private toPlainRecord<T>(value: MaybeMongooseDocument<T>): T {
    return typeof value.toObject === 'function' ? value.toObject() : value
  }

  private toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  private toOptionalId(
    value: MongoIdLike | string | undefined,
  ): string | undefined {
    return value ? this.toId(value) : undefined
  }

  private toOnboardingResponseEntity(
    response: MongoOnboardingResponseRecord | null,
  ): OnboardingResponseEntity | null {
    if (!response) return null

    const id = this.toOptionalId(response._id)
    const userId = this.toOptionalId(response.userId)
    const currentLevel = this.toRoadmapLevel(response.currentLevel)

    return new OnboardingResponseEntity({
      ...(id ? { id } : {}),
      ...(userId ? { userId } : {}),
      ...(typeof response.isCompleted === 'boolean'
        ? { isCompleted: response.isCompleted }
        : {}),
      ...(response.preparingFor
        ? { preparingFor: response.preparingFor }
        : {}),
      ...(response.goal ? { goal: response.goal } : {}),
      ...(currentLevel ? { currentLevel } : {}),
      ...(typeof response.completedStep === 'number'
        ? { completedStep: response.completedStep }
        : {}),
      ...(response.createdAt ? { createdAt: response.createdAt } : {}),
      ...(response.updatedAt ? { updatedAt: response.updatedAt } : {}),
    })
  }

  private toAIJobEntity(
    job: MongoAIGenerationJobRecord | null,
  ): AIGenerationJobEntity | null {
    if (!job) return null

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
    })
  }

  private toAIJobEntityOrThrow(
    job: MongoAIGenerationJobRecord | null,
  ): AIGenerationJobEntity {
    const entity = this.toAIJobEntity(job)

    if (!entity) {
      throw new OnboardingDomainError(
        'AI_JOB_MAPPING_FAILED',
        'Failed to map AI generation job',
      )
    }

    return entity
  }

  private toAIJobStepEntity(
    step: MongoAIGenerationStepRecord,
  ): AIGenerationStepEntity {
    const id = this.toOptionalId(step._id)
    const jobId = this.toOptionalId(step.jobId)

    return new AIGenerationStepEntity({
      ...(id ? { id } : {}),
      ...(jobId ? { jobId } : {}),
      stepNumber: step.stepNumber,
      stepLabel: step.stepLabel,
      status: this.toAIJobStepStatus(step.status),
      ...(step.startedAt ? { startedAt: step.startedAt } : {}),
      ...(step.completedAt ? { completedAt: step.completedAt } : {}),
    })
  }

  private toRoadmapLevel(value: string | undefined): RoadmapLevel | undefined {
    if (
      value === 'beginner' ||
      value === 'intermediate' ||
      value === 'advanced'
    ) {
      return value
    }

    return undefined
  }

  private toAIJobType(value: string): AIGenerationJobType {
    if (value === 'roadmap' || value === 'evaluation') {
      return value
    }

    throw new OnboardingDomainError(
      'INVALID_AI_JOB_TYPE',
      'Stored AI job type is invalid',
    )
  }

  private toAIJobStatus(value: string): AIGenerationJobStatus {
    if (
      value === 'pending' ||
      value === 'processing' ||
      value === 'completed' ||
      value === 'failed'
    ) {
      return value
    }

    throw new OnboardingDomainError(
      'INVALID_AI_JOB_STATUS',
      'Stored AI job status is invalid',
    )
  }

  private toAIJobStepStatus(value: string): AIGenerationStepStatus {
    if (
      value === 'pending' ||
      value === 'active' ||
      value === 'completed' ||
      value === 'failed'
    ) {
      return value
    }

    throw new OnboardingDomainError(
      'INVALID_AI_JOB_STEP_STATUS',
      'Stored AI job step status is invalid',
    )
  }
}

export const mongoOnboardingRepository = new MongoOnboardingRepository()
