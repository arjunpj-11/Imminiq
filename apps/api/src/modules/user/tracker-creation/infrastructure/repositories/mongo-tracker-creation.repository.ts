import type { AIGenerationJobEntity } from '../../domain/entities/ai-generation-job.entity';
import type { AIGenerationStepEntity } from '../../domain/entities/ai-generation-step.entity';
import type { TrackerCreationResponseEntity } from '../../domain/entities/tracker-creation-response.entity';
import type { RoadmapTreeEntity } from '../../domain/entities/roadmap-tree.entity';
import type {
  CreateAIJobStepsInput,
  CreateEvaluationAIJobInput,
  CreateRoadmapAIJobInput,
} from '../../domain/repositories/tracker-creation-ai-job-command.repository.interface';
import type { FindActiveEvaluationJobForRoadmapInput } from '../../domain/repositories/tracker-creation-ai-job-query.repository.interface';
import type {
  SaveTrackerCreationStep1Input,
  SaveTrackerCreationStep2Input,
} from '../../domain/repositories/tracker-creation-response-command.repository.interface';
import type { ITrackerCreationRepository } from '../../domain/repositories/tracker-creation.repository.interface';
import { MongoTrackerCreationAIJobRepository } from './internal/mongo-tracker-creation-ai-job.repository';
import { MongoTrackerCreationResponseRepository } from './internal/mongo-tracker-creation-response.repository';
import { MongoTrackerCreationRoadmapRepository } from './internal/mongo-tracker-creation-roadmap.repository';
import { MongoTrackerCreationMapper } from './shared/mongo-tracker-creation.mapper';

type MongoTrackerCreationRepositoryDependencies = {
  responseRepository: MongoTrackerCreationResponseRepository;
  aiJobRepository: MongoTrackerCreationAIJobRepository;
  roadmapRepository: MongoTrackerCreationRoadmapRepository;
};

export class MongoTrackerCreationRepository implements ITrackerCreationRepository {
  private readonly _responseRepository: MongoTrackerCreationResponseRepository;
  private readonly _aiJobRepository: MongoTrackerCreationAIJobRepository;
  private readonly _roadmapRepository: MongoTrackerCreationRoadmapRepository;

  constructor(
    mapper: MongoTrackerCreationMapper = new MongoTrackerCreationMapper(),
    dependencies: Partial<MongoTrackerCreationRepositoryDependencies> = {}
  ) {
    this._responseRepository =
      dependencies.responseRepository ?? new MongoTrackerCreationResponseRepository(mapper);

    this._aiJobRepository =
      dependencies.aiJobRepository ?? new MongoTrackerCreationAIJobRepository(mapper);

    this._roadmapRepository =
      dependencies.roadmapRepository ?? new MongoTrackerCreationRoadmapRepository(mapper);
  }

  getStatus(userId: string): Promise<TrackerCreationResponseEntity | null> {
    return this._responseRepository.getStatus(userId);
  }

  saveStep1(data: SaveTrackerCreationStep1Input): Promise<TrackerCreationResponseEntity | null> {
    return this._responseRepository.saveStep1(data);
  }

  saveStep2(data: SaveTrackerCreationStep2Input): Promise<TrackerCreationResponseEntity | null> {
    return this._responseRepository.saveStep2(data);
  }

  markCompleted(userId: string): Promise<TrackerCreationResponseEntity | null> {
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

export const mongoTrackerCreationRepository = new MongoTrackerCreationRepository();
