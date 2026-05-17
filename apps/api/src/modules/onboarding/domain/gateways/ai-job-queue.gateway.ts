import type { RoadmapLevel } from '../types/onboarding.types'

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

export interface AIJobQueueGateway {
  enqueueRoadmapGeneration(
    payload: GenerateRoadmapQueuePayload
  ): Promise<void>

  enqueueRoadmapEvaluation(
    payload: EvaluateRoadmapQueuePayload
  ): Promise<void>
}
