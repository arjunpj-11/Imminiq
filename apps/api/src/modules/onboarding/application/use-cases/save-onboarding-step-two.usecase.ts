import type { IOnboardingResponseCommandRepository } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type {
  IOnboardingResponseRecordDTO,
  ISaveOnboardingStepTwoPayloadDTO,
} from '../dtos/onboarding.dto'
import type { IOnboardingMapper } from '../mappers/onboarding.mapper'

export class SaveOnboardingStepTwoUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingResponseCommandRepository,
    private readonly _onboardingMapper: IOnboardingMapper,
  ) {}

  async execute(
    userId: string,
    payload: ISaveOnboardingStepTwoPayloadDTO,
  ): Promise<IOnboardingResponseRecordDTO | null> {
    const response = await this._onboardingRepository.saveStep2({
      userId,
      level: payload.level,
    })

    return this._onboardingMapper.toResponseDto(response)
  }
}