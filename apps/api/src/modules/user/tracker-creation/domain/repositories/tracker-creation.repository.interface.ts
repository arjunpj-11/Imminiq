import type { ITrackerCreationAIJobCommandRepository } from './tracker-creation-ai-job-command.repository.interface';
import type { ITrackerCreationAIJobQueryRepository } from './tracker-creation-ai-job-query.repository.interface';
import type { ITrackerCreationResponseCommandRepository } from './tracker-creation-response-command.repository.interface';
import type { ITrackerCreationResponseQueryRepository } from './tracker-creation-response-query.repository.interface';
import type { ITrackerCreationRoadmapRepository } from './tracker-creation-roadmap.repository.interface';

export interface ITrackerCreationRepository
  extends
    ITrackerCreationResponseQueryRepository,
    ITrackerCreationResponseCommandRepository,
    ITrackerCreationAIJobQueryRepository,
    ITrackerCreationAIJobCommandRepository,
    ITrackerCreationRoadmapRepository {}

export type {
  CreateAIJobStepsInput,
  CreateEvaluationAIJobInput,
  CreateRoadmapAIJobInput,
  EvaluationJobInput,
  RoadmapJobInput,
} from './tracker-creation-ai-job-command.repository.interface';

export type { FindActiveEvaluationJobForRoadmapInput } from './tracker-creation-ai-job-query.repository.interface';

export type {
  SaveTrackerCreationStep1Input,
  SaveTrackerCreationStep2Input,
} from './tracker-creation-response-command.repository.interface';
