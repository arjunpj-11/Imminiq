import type { IOnboardingAIJobCommandRepository } from './onboarding-ai-job-command.repository.interface';
import type { IOnboardingAIJobQueryRepository } from './onboarding-ai-job-query.repository.interface';
import type { IOnboardingResponseCommandRepository } from './onboarding-response-command.repository.interface';
import type { IOnboardingResponseQueryRepository } from './onboarding-response-query.repository.interface';
import type { IOnboardingRoadmapRepository } from './onboarding-roadmap.repository.interface';

export interface IOnboardingRepository
  extends
    IOnboardingResponseQueryRepository,
    IOnboardingResponseCommandRepository,
    IOnboardingAIJobQueryRepository,
    IOnboardingAIJobCommandRepository,
    IOnboardingRoadmapRepository {}

export type {
  CreateAIJobStepsInput,
  CreateEvaluationAIJobInput,
  CreateRoadmapAIJobInput,
  EvaluationJobInput,
  RoadmapJobInput,
} from './onboarding-ai-job-command.repository.interface';

export type { FindActiveEvaluationJobForRoadmapInput } from './onboarding-ai-job-query.repository.interface';

export type {
  SaveOnboardingStep1Input,
  SaveOnboardingStep2Input,
} from './onboarding-response-command.repository.interface';
