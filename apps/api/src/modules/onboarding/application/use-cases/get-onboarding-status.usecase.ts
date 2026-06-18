import type { OnboardingResponseQueryRepositoryContract } from '../../domain/repositories/onboarding-response-query.repository.interface'
import type { OnboardingStatusResult } from '../dtos/onboarding.dto'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'

export class GetOnboardingStatusUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingResponseQueryRepositoryContract,
    private readonly onboardingMapper: OnboardingMapperContract,
  ) {}

  async execute(userId: string): Promise<OnboardingStatusResult> {
    const response = await this.onboardingRepository.getStatus(userId)

    return this.onboardingMapper.toStatusDto(response)
  }
}
