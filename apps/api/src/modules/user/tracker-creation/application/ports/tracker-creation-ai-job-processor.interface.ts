export type RoadmapGenerationJobPayload = {
  jobId: string;
  userId: string;
  topic: string;
  goal?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguage: string;
};

export type RoadmapEvaluationJobPayload = {
  jobId: string;
  trackerId: string;
  sourceRoadmapJobId?: string;
  sourceTrackerId?: string;
  sourceTrackerCreatedAt?: string;
  analysisKind?: 'generated_roadmap' | 'clone_freshness';
};

export interface ITrackerCreationAIJobProcessor {
  processRoadmapGeneration(payload: RoadmapGenerationJobPayload): Promise<void>;
  processRoadmapEvaluation(payload: RoadmapEvaluationJobPayload): Promise<void>;
}
