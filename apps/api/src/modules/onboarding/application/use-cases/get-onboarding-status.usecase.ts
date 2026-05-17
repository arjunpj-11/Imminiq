import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type { OnboardingStatusResult } from '../../domain/types/onboarding.types'

export class GetOnboardingStatusUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(userId: string): Promise<OnboardingStatusResult> {
    const response =
      await this.onboardingRepository.getStatus(userId)

    return {
      isCompleted: response?.isCompleted || false,

      step1Completed: Boolean(
        response?.preparingFor
      ),

      step2Completed: Boolean(
        response?.currentLevel
      ),

      completedStep: response?.completedStep || 0,

      data: response,
    }
  }
}
