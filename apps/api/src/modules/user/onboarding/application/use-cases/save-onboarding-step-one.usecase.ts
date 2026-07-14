import type { IOnboardingResponseCommandRepository } from '../../domain/repositories/onboarding-response-command.repository.interface';
import type {
  OnboardingResponseRecordDTO,
  SaveOnboardingStepOnePayloadDTO,
} from '../onboarding.dto';
import type { IOnboardingMapper } from '../onboarding.mapper';

export interface ISaveOnboardingStepOneUseCase {
  execute(
    userId: string,
    payload: SaveOnboardingStepOnePayloadDTO
  ): Promise<OnboardingResponseRecordDTO | null>;
}

export class SaveOnboardingStepOneUseCase implements ISaveOnboardingStepOneUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingResponseCommandRepository,
    private readonly _onboardingMapper: IOnboardingMapper
  ) {}

  async execute(
    userId: string,
    payload: SaveOnboardingStepOnePayloadDTO
  ): Promise<OnboardingResponseRecordDTO | null> {
    const response = await this._onboardingRepository.saveStep1({
      userId,
      topic: payload.topic,
      goal: payload.goal,
    });

    return this._onboardingMapper.toResponseDto(response);
  }
}
