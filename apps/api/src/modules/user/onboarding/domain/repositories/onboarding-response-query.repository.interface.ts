import type { OnboardingResponseEntity } from '../entities/onboarding-response.entity';

export interface IOnboardingResponseQueryRepository {
  getStatus(userId: string): Promise<OnboardingResponseEntity | null>;
}
