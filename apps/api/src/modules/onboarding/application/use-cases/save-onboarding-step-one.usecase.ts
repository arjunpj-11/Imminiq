import type { OnboardingResponseCommandRepositoryContract } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type {
  OnboardingResponseRecord,
  SaveOnboardingStepOnePayload,
} from '../dtos/onboarding.dto'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'

export class SaveOnboardingStepOneUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingResponseCommandRepositoryContract,
    private readonly onboardingMapper: OnboardingMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: SaveOnboardingStepOnePayload,
  ): Promise<OnboardingResponseRecord | null> {
    const response = await this.onboardingRepository.saveStep1(
      userId,
      payload.topic,
      payload.goal,
    )

    return this.onboardingMapper.toResponseDto(response)
  }
}
