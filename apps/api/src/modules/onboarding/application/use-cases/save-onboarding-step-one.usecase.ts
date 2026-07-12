import type { IOnboardingResponseCommandRepository } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type {
  IOnboardingResponseRecordDTO,
  ISaveOnboardingStepOnePayloadDTO,
} from '../dtos/onboarding.dto'
import type { IOnboardingMapper } from '../mappers/onboarding.mapper'

export class SaveOnboardingStepOneUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingResponseCommandRepository,
    private readonly _onboardingMapper: IOnboardingMapper,
  ) {}

  async execute(
    userId: string,
    payload: ISaveOnboardingStepOnePayloadDTO,
  ): Promise<IOnboardingResponseRecordDTO | null> {
    const response = await this._onboardingRepository.saveStep1({
      userId,
      topic: payload.topic,
      goal: payload.goal,
    })

    return this._onboardingMapper.toResponseDto(response)
  }
}