import type { OnboardingResponseQueryRepositoryContract } from '../../domain/repositories/onboarding-response-query.repository.interface'
import type { OnboardingStatusResult } from '../dtos/onboarding.dto'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'

export class GetOnboardingStatusUseCase {
  constructor(
    private readonly _onboardingRepository: OnboardingResponseQueryRepositoryContract,
    private readonly _onboardingMapper: OnboardingMapperContract,
  ) {}

  async execute(userId: string): Promise<OnboardingStatusResult> {
    const response = await this._onboardingRepository.getStatus(userId)

    return this._onboardingMapper.toStatusDto(response)
  }
}
