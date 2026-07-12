import { AIGenerationJob } from '../../../../../infrastructure/database/models/ai-generation-job.model'
import { AIGenerationStep } from '../../../../../infrastructure/database/models/ai-generation-step.model'
import {
  ROADMAP_EVALUATION_TOTAL_STEPS,
  ROADMAP_GENERATION_TOTAL_STEPS,
} from '../../../domain/onboarding.constants'
import type { AIGenerationJobEntity } from '../../../domain/entities/ai-generation-job.entity'
import type { AIGenerationStepEntity } from '../../../domain/entities/ai-generation-step.entity'
import type {
  CreateAIJobStepsInput,
  CreateEvaluationAIJobInput,
  CreateRoadmapAIJobInput,
} from '../../../domain/repositories/onboarding-ai-job-command.repository.interface'
import type { FindActiveEvaluationJobForRoadmapInput } from '../../../domain/repositories/onboarding-ai-job-query.repository.interface'
import { MongoOnboardingBaseRepository } from '../shared/mongo-onboarding-base.repository'
import { MongoOnboardingErrorMapper } from '../shared/mongo-onboarding-error.mapper'
import { MongoOnboardingMapper } from '../shared/mongo-onboarding.mapper'
import type {
  MaybeMongooseDocument,
  MongoAIGenerationJobRecord,
  MongoAIGenerationStepRecord,
} from '../shared/mongo-onboarding.types'

export class MongoOnboardingAIJobRepository extends MongoOnboardingBaseRepository {
  constructor(private readonly _mapper = new MongoOnboardingMapper()) {
    super()
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
}

export const mongoOnboardingAIJobRepository =
  new MongoOnboardingAIJobRepository()
