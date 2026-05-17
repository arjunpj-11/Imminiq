import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'

export class SaveOnboardingStepOneUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(
    userId: string,
    topic: string,
    goal?: string
  ) {
    return this.onboardingRepository.saveStep1(
      userId,
      topic,
      goal
    )
  }
}
