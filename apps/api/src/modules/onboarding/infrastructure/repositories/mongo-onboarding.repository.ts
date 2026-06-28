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
import type { AIGenerationJobEntity } from '../../domain/entities/ai-generation-job.entity'
import type { AIGenerationStepEntity } from '../../domain/entities/ai-generation-step.entity'
import type { OnboardingResponseEntity } from '../../domain/entities/onboarding-response.entity'
import type { RoadmapTreeEntity } from '../../domain/entities/roadmap-tree.entity'
import type {
  CreateAIJobStepsInput,
  CreateEvaluationAIJobInput,
  CreateRoadmapAIJobInput,
} from '../../domain/repositories/onboarding-ai-job-command.repository.interface'
import type { FindActiveEvaluationJobForRoadmapInput } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type {
  SaveOnboardingStep1Input,
  SaveOnboardingStep2Input,
} from '../../domain/repositories/onboarding-response-command.repository.interface'
import type { OnboardingRepositoryContract } from '../../domain/repositories/onboarding.repository.interface'
import { MongoOnboardingBaseRepository } from './mongo-onboarding-base.repository'
import { MongoOnboardingErrorMapper } from './mongo-onboarding-error.mapper'
import { MongoOnboardingMapper } from './mongo-onboarding.mapper'
import type {
  MaybeMongooseDocument,
  MongoAIGenerationJobRecord,
  MongoAIGenerationStepRecord,
  MongoOnboardingResponseRecord,
  MongoRoadmapSubtopicRecord,
  MongoRoadmapTopicRecord,
  MongoTrackerRecord,
} from './mongo-onboarding.types'

export class MongoOnboardingRepository
  extends MongoOnboardingBaseRepository
  implements OnboardingRepositoryContract
{
  constructor(private readonly _mapper = new MongoOnboardingMapper()) {
    super()
  }

  async getStatus(userId: string): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_STATUS_QUERY_FAILED',
      'Onboarding status query failed',
      async () => {
        const response = await OnboardingResponse.findOne({
          userId,
          deletedAt: null,
        }).lean<MongoOnboardingResponseRecord>()

        return this._mapper.toOnboardingResponseEntity(response)
      },
    )
  }

  async saveStep1(
    data: SaveOnboardingStep1Input,
  ): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_STEP_ONE_SAVE_FAILED',
      'Failed to save onboarding step one',
      async () => {
        const response = await OnboardingResponse.findOneAndUpdate(
          {
            userId: data.userId,
            deletedAt: null,
          },
          {
            $set: {
              preparingFor: data.topic,
              goal: data.goal ?? '',
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

        return this._mapper.toOnboardingResponseEntity(response)
      },
      MongoOnboardingErrorMapper.mapDuplicateRecordError,
    )
  }

  async saveStep2(
    data: SaveOnboardingStep2Input,
  ): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_STEP_TWO_SAVE_FAILED',
      'Failed to save onboarding step two',
      async () => {
        const response = await OnboardingResponse.findOneAndUpdate(
          {
            userId: data.userId,
            deletedAt: null,
          },
          {
            $set: {
              currentLevel: data.level,
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

        return this._mapper.toOnboardingResponseEntity(response)
      },
      MongoOnboardingErrorMapper.mapDuplicateRecordError,
    )
  }

  async markCompleted(
    userId: string,
  ): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_COMPLETION_SAVE_FAILED',
      'Failed to save onboarding completion',
      async () => {
        const response = await OnboardingResponse.findOneAndUpdate(
          {
            userId,
            deletedAt: null,
          },
          {
            $set: {
              isCompleted: true,
              completedStep: 2,
            },
          },
          {
            new: true,
          },
        ).lean<MongoOnboardingResponseRecord>()

        return this._mapper.toOnboardingResponseEntity(response)
      },
    )
  }

  async findActiveRoadmapJobForUser(
    userId: string,
  ): Promise<AIGenerationJobEntity | null> {
    return this.execute(
      'ACTIVE_ROADMAP_JOB_QUERY_FAILED',
      'Failed to read active roadmap job',
      async () => {
        const job = await AIGenerationJob.findOne({
          userId,
          jobType: 'roadmap',
          status: {
            $in: ['pending', 'processing'],
          },
          deletedAt: null,
        })
          .sort({
            createdAt: -1,
          })
          .lean<MongoAIGenerationJobRecord>()

        return this._mapper.toAIJobEntity(job)
      },
    )
  }

  async findActiveEvaluationJobForRoadmap(
    input: FindActiveEvaluationJobForRoadmapInput,
  ): Promise<AIGenerationJobEntity | null> {
    return this.execute(
      'ACTIVE_EVALUATION_JOB_QUERY_FAILED',
      'Failed to read active evaluation job',
      async () => {
        const job = await AIGenerationJob.findOne({
          userId: input.userId,
          jobType: 'evaluation',
          'inputData.sourceRoadmapJobId': input.sourceRoadmapJobId,
          status: {
            $in: ['pending', 'processing'],
          },
          deletedAt: null,
        })
          .sort({
            createdAt: -1,
          })
          .lean<MongoAIGenerationJobRecord>()

        return this._mapper.toAIJobEntity(job)
      },
    )
  }

  async createAIJob(
    data: CreateRoadmapAIJobInput,
  ): Promise<AIGenerationJobEntity> {
    return this.execute(
      'ROADMAP_JOB_CREATE_FAILED',
      'Failed to create roadmap AI job',
      async () => {
        const persistenceInputData: Record<string, unknown> = {
          topic: data.inputData.topic,
          ...(data.inputData.goal !== undefined
            ? { goal: data.inputData.goal }
            : {}),
          level: data.inputData.level,
        }

        const aiJob = await AIGenerationJob.create({
          userId: data.userId,
          jobType: 'roadmap',
          status: 'pending',
          inputData: persistenceInputData,
          totalSteps: ROADMAP_GENERATION_TOTAL_STEPS,
          currentStep: 0,
        })

        return this._mapper.toAIJobEntityOrThrow(
          this._mapper.toPlainRecord(
            aiJob as unknown as MaybeMongooseDocument<MongoAIGenerationJobRecord>,
          ),
        )
      },
      MongoOnboardingErrorMapper.mapDuplicateRecordError,
    )
  }

  async createEvaluationAIJob(
    data: CreateEvaluationAIJobInput,
  ): Promise<AIGenerationJobEntity> {
    return this.execute(
      'EVALUATION_JOB_CREATE_FAILED',
      'Failed to create evaluation AI job',
      async () => {
        const persistenceInputData: Record<string, unknown> = {
          sourceRoadmapJobId: data.inputData.sourceRoadmapJobId,
          trackerId: data.inputData.trackerId,
        }

        const aiJob = await AIGenerationJob.create({
          userId: data.userId,
          jobType: 'evaluation',
          status: 'pending',
          inputData: persistenceInputData,
          totalSteps: ROADMAP_EVALUATION_TOTAL_STEPS,
          currentStep: 0,
        })

        return this._mapper.toAIJobEntityOrThrow(
          this._mapper.toPlainRecord(
            aiJob as unknown as MaybeMongooseDocument<MongoAIGenerationJobRecord>,
          ),
        )
      },
      MongoOnboardingErrorMapper.mapDuplicateRecordError,
    )
  }

  async createAIJobSteps(data: CreateAIJobStepsInput): Promise<void> {
    await this.execute(
      'AI_JOB_STEPS_CREATE_FAILED',
      'Failed to create AI job steps',
      async () => {
        await AIGenerationStep.insertMany(
          data.stepLabels.map((stepLabel, index) => ({
            jobId: data.jobId,
            stepNumber: index + 1,
            stepLabel,
            status: 'pending',
          })),
        )
      },
      MongoOnboardingErrorMapper.mapDuplicateRecordError,
    )
  }

  async getJobById(jobId: string): Promise<AIGenerationJobEntity | null> {
    return this.execute(
      'AI_JOB_QUERY_FAILED',
      'Failed to read AI job',
      async () => {
        const job = await AIGenerationJob.findOne({
          _id: jobId,
          deletedAt: null,
        }).lean<MongoAIGenerationJobRecord>()

        return this._mapper.toAIJobEntity(job)
      },
    )
  }

  async getJobSteps(jobId: string): Promise<AIGenerationStepEntity[]> {
    return this.execute(
      'AI_JOB_STEPS_QUERY_FAILED',
      'Failed to read AI job steps',
      async () => {
        const steps = await AIGenerationStep.find({
          jobId,
          deletedAt: null,
        })
          .sort({
            stepNumber: 1,
          })
          .lean<MongoAIGenerationStepRecord[]>()

        return steps.map((step) => this._mapper.toAIJobStepEntity(step))
      },
    )
  }

  async getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity> {
    return this.execute(
      'ROADMAP_TREE_QUERY_FAILED',
      'Failed to read roadmap tree',
      async () => {
        const [tracker, topics, subtopics] = await Promise.all([
          Tracker.findOne({
            _id: trackerId,
            deletedAt: null,
          }).lean<MongoTrackerRecord>(),
          TrackerTopic.find({
            trackerId,
            deletedAt: null,
          })
            .sort({
              order: 1,
            })
            .lean<MongoRoadmapTopicRecord[]>(),
          TrackerSubtopic.find({
            trackerId,
            deletedAt: null,
          })
            .sort({
              depth: 1,
              order: 1,
            })
            .lean<MongoRoadmapSubtopicRecord[]>(),
        ])

        return this._mapper.toRoadmapTreeEntity({
          tracker,
          topics,
          subtopics,
        })
      },
    )
  }
}

export const mongoOnboardingRepository = new MongoOnboardingRepository()