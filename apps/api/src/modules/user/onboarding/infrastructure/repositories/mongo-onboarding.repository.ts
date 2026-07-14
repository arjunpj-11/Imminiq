import type { AIGenerationJobEntity } from '../../domain/entities/ai-generation-job.entity';
import type { AIGenerationStepEntity } from '../../domain/entities/ai-generation-step.entity';
import type { OnboardingResponseEntity } from '../../domain/entities/onboarding-response.entity';
import type { RoadmapTreeEntity } from '../../domain/entities/roadmap-tree.entity';
import type {
  CreateAIJobStepsInput,
  CreateEvaluationAIJobInput,
  CreateRoadmapAIJobInput,
} from '../../domain/repositories/onboarding-ai-job-command.repository.interface';
import type { FindActiveEvaluationJobForRoadmapInput } from '../../domain/repositories/onboarding-ai-job-query.repository.interface';
import type {
  SaveOnboardingStep1Input,
  SaveOnboardingStep2Input,
} from '../../domain/repositories/onboarding-response-command.repository.interface';
import type { IOnboardingRepository } from '../../domain/repositories/onboarding.repository.interface';
import { MongoOnboardingAIJobRepository } from './internal/mongo-onboarding-ai-job.repository';
import { MongoOnboardingResponseRepository } from './internal/mongo-onboarding-response.repository';
import { MongoOnboardingRoadmapRepository } from './internal/mongo-onboarding-roadmap.repository';
import { MongoOnboardingMapper } from './shared/mongo-onboarding.mapper';

type MongoOnboardingRepositoryDependencies = {
  responseRepository: MongoOnboardingResponseRepository;
  aiJobRepository: MongoOnboardingAIJobRepository;
  roadmapRepository: MongoOnboardingRoadmapRepository;
};

export class MongoOnboardingRepository implements IOnboardingRepository {
  private readonly _responseRepository: MongoOnboardingResponseRepository;
  private readonly _aiJobRepository: MongoOnboardingAIJobRepository;
  private readonly _roadmapRepository: MongoOnboardingRoadmapRepository;

  constructor(
    mapper: MongoOnboardingMapper = new MongoOnboardingMapper(),
    dependencies: Partial<MongoOnboardingRepositoryDependencies> = {}
  ) {
    this._responseRepository =
      dependencies.responseRepository ?? new MongoOnboardingResponseRepository(mapper);

    this._aiJobRepository =
      dependencies.aiJobRepository ?? new MongoOnboardingAIJobRepository(mapper);

    this._roadmapRepository =
      dependencies.roadmapRepository ?? new MongoOnboardingRoadmapRepository(mapper);
  }

  getStatus(userId: string): Promise<OnboardingResponseEntity | null> {
    return this._responseRepository.getStatus(userId);
  }

  saveStep1(data: SaveOnboardingStep1Input): Promise<OnboardingResponseEntity | null> {
    return this._responseRepository.saveStep1(data);
  }

  saveStep2(data: SaveOnboardingStep2Input): Promise<OnboardingResponseEntity | null> {
    return this._responseRepository.saveStep2(data);
  }

  markCompleted(userId: string): Promise<OnboardingResponseEntity | null> {
    return this._responseRepository.markCompleted(userId);
  }

  findActiveRoadmapJobForUser(userId: string): Promise<AIGenerationJobEntity | null> {
    return this._aiJobRepository.findActiveRoadmapJobForUser(userId);
  }

  findActiveEvaluationJobForRoadmap(
    input: FindActiveEvaluationJobForRoadmapInput
  ): Promise<AIGenerationJobEntity | null> {
    return this._aiJobRepository.findActiveEvaluationJobForRoadmap(input);
  }

  createAIJob(data: CreateRoadmapAIJobInput): Promise<AIGenerationJobEntity> {
    return this._aiJobRepository.createAIJob(data);
  }

  createEvaluationAIJob(data: CreateEvaluationAIJobInput): Promise<AIGenerationJobEntity> {
    return this._aiJobRepository.createEvaluationAIJob(data);
  }

  createAIJobSteps(data: CreateAIJobStepsInput): Promise<void> {
    return this._aiJobRepository.createAIJobSteps(data);
  }

  getJobById(jobId: string): Promise<AIGenerationJobEntity | null> {
    return this._aiJobRepository.getJobById(jobId);
  }

  getJobSteps(jobId: string): Promise<AIGenerationStepEntity[]> {
    return this._aiJobRepository.getJobSteps(jobId);
  }

  getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity> {
    return this._roadmapRepository.getRoadmapTree(trackerId);
  }
}

export const mongoOnboardingRepository = new MongoOnboardingRepository();
