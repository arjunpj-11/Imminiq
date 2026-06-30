import type { OnboardingResponseCommandRepositoryContract } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type {
  OnboardingResponseRecord,
  SaveOnboardingStepTwoPayload,
} from '../dtos/onboarding.dto'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'

export class SaveOnboardingStepTwoUseCase {
  constructor(
    private readonly _onboardingRepository: OnboardingResponseCommandRepositoryContract,
    private readonly _onboardingMapper: OnboardingMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: SaveOnboardingStepTwoPayload,
  ): Promise<OnboardingResponseRecord | null> {
    const response = await this._onboardingRepository.saveStep2({
      userId,
      level: payload.level,
    })

    return this._onboardingMapper.toResponseDto(response)
  }
}