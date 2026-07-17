import type { TrackerCreationUseCases } from './application/tracker-creation-use-cases.contract';
import { TrackerCreationMapper, type ITrackerCreationMapper } from './application/tracker-creation.mapper';
import {
  TrackerCreationJobOutputReader,
  type ITrackerCreationJobOutputReader,
} from './application/services/tracker-creation-job-output-reader.service';
import { EvaluateRoadmapUseCase } from './application/use-cases/evaluate-roadmap.usecase';
import { AnalyzeClonedTrackerUseCase } from './application/use-cases/analyze-cloned-tracker.usecase';
import { GenerateRoadmapUseCase } from './application/use-cases/generate-roadmap.usecase';
import { GetRoadmapEvaluationResultUseCase } from './application/use-cases/get-roadmap-evaluation-result.usecase';
import { GetRoadmapJobResultUseCase } from './application/use-cases/get-roadmap-job-result.usecase';
import { GetRoadmapJobStatusUseCase } from './application/use-cases/get-roadmap-job-status.usecase';
import { GetActiveRoadmapJobUseCase } from './application/use-cases/get-active-roadmap-job.usecase';
import { SaveTrackerCreationStepOneUseCase } from './application/use-cases/save-tracker-creation-step-one.usecase';
import { SaveTrackerCreationStepTwoUseCase } from './application/use-cases/save-tracker-creation-step-two.usecase';
import { ContinueTrackerIntakeUseCase } from './application/use-cases/continue-tracker-intake.usecase';
import type { IAIJobQueueGateway } from './domain/services/ai-job-queue.interface';
import type { IAIJobQuotaStore } from './domain/services/ai-job-quota-store.interface';
import { bullMqAIJobQueueGateway } from './infrastructure/gateways/bullmq-ai-job-queue.gateway';
import { mongoTrackerCreationRepository } from './infrastructure/repositories/mongo-tracker-creation.repository';
import { mongoCloneFreshnessAnalysisRepository } from './infrastructure/repositories/mongo-clone-freshness-analysis.repository';
import { redisAIJobQuotaStore } from './infrastructure/stores/redis-ai-job-quota.store';
import { langChainTrackerIntakeAgent } from './infrastructure/services/langchain-tracker-intake-agent.service';

export type TrackerCreationServiceHelpers = {
  trackerCreationAIJobQueueGateway: IAIJobQueueGateway;
  trackerCreationAIJobQuotaStore: IAIJobQuotaStore;
  trackerCreationMapper: ITrackerCreationMapper;
  trackerCreationJobOutputReader: ITrackerCreationJobOutputReader;
};

export type TrackerCreationComposition = {
  useCases: TrackerCreationUseCases;
  helpers: TrackerCreationServiceHelpers;
};

export const createTrackerCreationComposition = (): TrackerCreationComposition => {
  const trackerCreationRepository = mongoTrackerCreationRepository;
  const trackerCreationAIJobQueueGateway = bullMqAIJobQueueGateway;
  const trackerCreationAIJobQuotaStore = redisAIJobQuotaStore;
  const trackerCreationMapper = new TrackerCreationMapper();
  const trackerCreationJobOutputReader = new TrackerCreationJobOutputReader();

  return {
    useCases: {
      continueTrackerIntake: new ContinueTrackerIntakeUseCase(langChainTrackerIntakeAgent),
      saveTrackerCreationStepOne: new SaveTrackerCreationStepOneUseCase(
        trackerCreationRepository,
        trackerCreationMapper
      ),

      saveTrackerCreationStepTwo: new SaveTrackerCreationStepTwoUseCase(
        trackerCreationRepository,
        trackerCreationMapper
      ),

      generateRoadmap: new GenerateRoadmapUseCase(
        trackerCreationRepository,
        trackerCreationAIJobQueueGateway,
        trackerCreationAIJobQuotaStore
      ),

      getActiveRoadmapJob: new GetActiveRoadmapJobUseCase(trackerCreationRepository),

      getRoadmapJobStatus: new GetRoadmapJobStatusUseCase(
        trackerCreationRepository,
        trackerCreationMapper,
        trackerCreationJobOutputReader
      ),

      getRoadmapJobResult: new GetRoadmapJobResultUseCase(
        trackerCreationRepository,
        trackerCreationMapper,
        trackerCreationJobOutputReader
      ),

      evaluateRoadmap: new EvaluateRoadmapUseCase(
        trackerCreationRepository,
        trackerCreationAIJobQueueGateway,
        trackerCreationAIJobQuotaStore,
        trackerCreationJobOutputReader
      ),

      analyzeClonedTracker: new AnalyzeClonedTrackerUseCase(
        trackerCreationRepository,
        mongoCloneFreshnessAnalysisRepository,
        trackerCreationAIJobQueueGateway,
        trackerCreationAIJobQuotaStore
      ),

      getRoadmapEvaluationResult: new GetRoadmapEvaluationResultUseCase(
        trackerCreationRepository,
        trackerCreationJobOutputReader
      ),
    },

    helpers: {
      trackerCreationAIJobQueueGateway,
      trackerCreationAIJobQuotaStore,
      trackerCreationMapper,
      trackerCreationJobOutputReader,
    },
  };
};
