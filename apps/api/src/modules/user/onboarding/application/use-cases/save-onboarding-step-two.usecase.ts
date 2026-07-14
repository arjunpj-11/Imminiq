import type { IOnboardingResponseCommandRepository } from '../../domain/repositories/onboarding-response-command.repository.interface';
import type {
  IOnboardingResponseRecordDTO,
  ISaveOnboardingStepTwoPayloadDTO,
} from '../onboarding.dto';
import type { IOnboardingMapper } from '../onboarding.mapper';

export interface ISaveOnboardingStepTwoUseCase {
  execute(
    userId: string,
    payload: ISaveOnboardingStepTwoPayloadDTO
  ): Promise<IOnboardingResponseRecordDTO | null>;
}

export class SaveOnboardingStepTwoUseCase implements ISaveOnboardingStepTwoUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingResponseCommandRepository,
    private readonly _onboardingMapper: IOnboardingMapper
  ) {}

  async execute(
    userId: string,
    payload: ISaveOnboardingStepTwoPayloadDTO
  ): Promise<IOnboardingResponseRecordDTO | null> {
    const response = await this._onboardingRepository.saveStep2({
      userId,
      level: payload.level,
    });

    return this._onboardingMapper.toResponseDto(response);
  }
}
