import type { OnboardingResponseCommandRepositoryContract } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type {
  OnboardingResponseRecord,
  SaveOnboardingStepTwoPayload,
} from '../dtos/onboarding.dto'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'

export class SaveOnboardingStepTwoUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingResponseCommandRepositoryContract,
    private readonly onboardingMapper: OnboardingMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: SaveOnboardingStepTwoPayload,
  ): Promise<OnboardingResponseRecord | null> {
    const response = await this.onboardingRepository.saveStep2(
      userId,
      payload.level,
    )

    return this.onboardingMapper.toResponseDto(response)
  }
}
