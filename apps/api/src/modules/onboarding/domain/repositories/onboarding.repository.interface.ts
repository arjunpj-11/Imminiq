import type { OnboardingAIJobCommandRepositoryContract } from './onboarding-ai-job-command.repository.interface'
import type { OnboardingAIJobQueryRepositoryContract } from './onboarding-ai-job-query.repository.interface'
import type { OnboardingResponseCommandRepositoryContract } from './onboarding-response-command.repository.interface'
import type { OnboardingResponseQueryRepositoryContract } from './onboarding-response-query.repository.interface'
import type { OnboardingRoadmapRepositoryContract } from './onboarding-roadmap.repository.interface'

export interface OnboardingRepositoryContract
  extends OnboardingResponseQueryRepositoryContract,
    OnboardingResponseCommandRepositoryContract,
    OnboardingAIJobQueryRepositoryContract,
    OnboardingAIJobCommandRepositoryContract,
    OnboardingRoadmapRepositoryContract {}

export type {
  CreateAIJobStepsInput,
  CreateEvaluationAIJobInput,
  CreateRoadmapAIJobInput,
  EvaluationJobInput,
  RoadmapJobInput,
} from './onboarding-ai-job-command.repository.interface'

export type { FindActiveEvaluationJobForRoadmapInput } from './onboarding-ai-job-query.repository.interface'

export type {
  SaveOnboardingStep1Input,
  SaveOnboardingStep2Input,
} from './onboarding-response-command.repository.interface'