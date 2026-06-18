import type { OnboardingResponseEntity } from '../entities/onboarding-response.entity'
import type { RoadmapLevel } from '../value-objects/roadmap-level.vo'

export interface OnboardingResponseCommandRepositoryContract {
  saveStep1(
    userId: string,
    topic: string,
    goal?: string,
  ): Promise<OnboardingResponseEntity | null>

  saveStep2(
    userId: string,
    level: RoadmapLevel,
  ): Promise<OnboardingResponseEntity | null>

  markCompleted(userId: string): Promise<OnboardingResponseEntity | null>
}
