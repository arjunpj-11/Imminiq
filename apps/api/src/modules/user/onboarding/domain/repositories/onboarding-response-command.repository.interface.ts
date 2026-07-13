import type { OnboardingResponseEntity } from '../entities/onboarding-response.entity'
import type { RoadmapLevel } from '../value-objects/roadmap-level.vo'

export type SaveOnboardingStep1Input = {
  userId: string
  topic: string
  goal?: string
}

export type SaveOnboardingStep2Input = {
  userId: string
  level: RoadmapLevel
}

export interface IOnboardingResponseCommandRepository {
  saveStep1(
    data: SaveOnboardingStep1Input
  ): Promise<OnboardingResponseEntity | null>

  saveStep2(
    data: SaveOnboardingStep2Input
  ): Promise<OnboardingResponseEntity | null>

  markCompleted(userId: string): Promise<OnboardingResponseEntity | null>
}