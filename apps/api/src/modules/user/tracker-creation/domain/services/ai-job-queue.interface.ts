import type { RoadmapLevel } from '../value-objects/roadmap-level.vo';

export interface IGenerateRoadmapQueuePayload {
  jobId: string;
  userId: string;
  topic: string;
  goal?: string;
  level: RoadmapLevel;
  preferredLanguage: string;
}

export interface IEvaluateRoadmapQueuePayload {
  jobId: string;
  userId: string;
  trackerId: string;
  sourceRoadmapJobId?: string;
  sourceTrackerId?: string;
  analysisKind?: 'generated_roadmap' | 'clone_freshness';
  sourceTrackerCreatedAt?: string;
}

export interface IAIJobQueueGateway {
  enqueueRoadmapGeneration(payload: IGenerateRoadmapQueuePayload): Promise<void>;

  enqueueRoadmapEvaluation(payload: IEvaluateRoadmapQueuePayload): Promise<void>;
}
