import type { RoadmapLevel } from '../value-objects/roadmap-level.vo'

export interface GenerateRoadmapQueuePayload {
  jobId: string
  userId: string
  topic: string
  goal?: string
  level: RoadmapLevel
}

export interface EvaluateRoadmapQueuePayload {
  jobId: string
  userId: string
  trackerId: string
  sourceRoadmapJobId: string
}

export interface AIJobQueueGatewayContract {
  enqueueRoadmapGeneration(
    payload: GenerateRoadmapQueuePayload,
  ): Promise<void>

  enqueueRoadmapEvaluation(
    payload: EvaluateRoadmapQueuePayload,
  ): Promise<void>
}
