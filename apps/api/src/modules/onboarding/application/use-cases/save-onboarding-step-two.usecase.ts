import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type { RoadmapLevel } from '../../domain/types/onboarding.types'

export class SaveOnboardingStepTwoUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(
    userId: string,
    level: RoadmapLevel
  ) {
    return this.onboardingRepository.saveStep2(
      userId,
      level
    )
  }
}
