import type { OnboardingResponseCommandRepositoryContract } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type {
  OnboardingResponseRecord,
  SaveOnboardingStepOnePayload,
} from '../dtos/onboarding.dto'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'

export class SaveOnboardingStepOneUseCase {
  constructor(
    private readonly _onboardingRepository: OnboardingResponseCommandRepositoryContract,
    private readonly _onboardingMapper: OnboardingMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: SaveOnboardingStepOnePayload,
  ): Promise<OnboardingResponseRecord | null> {
    const response = await this._onboardingRepository.saveStep1({
      userId,
      topic: payload.topic,
      goal: payload.goal,
    })

    return this._onboardingMapper.toResponseDto(response)
  }
}