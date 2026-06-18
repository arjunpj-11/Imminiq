import type { OnboardingResponseEntity } from '../entities/onboarding-response.entity'

export interface OnboardingResponseQueryRepositoryContract {
  getStatus(userId: string): Promise<OnboardingResponseEntity | null>
}
