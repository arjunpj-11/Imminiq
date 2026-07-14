import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { IUpdateLearningJourneyPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateLearningJourneyRepository = {
  updateLearningJourney: ISettingsCommandRepository['updateLearningJourney'];
};

export interface IUpdateLearningJourneyUseCase {
  execute(
    userId: string,
    payload: IUpdateLearningJourneyPayloadDTO
  ): Promise<UserSettingsViewDTO | null>;
}

export class UpdateLearningJourneyUseCase implements IUpdateLearningJourneyUseCase {
  constructor(
    private readonly _settingsRepository: UpdateLearningJourneyRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: IUpdateLearningJourneyPayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateLearningJourney({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
