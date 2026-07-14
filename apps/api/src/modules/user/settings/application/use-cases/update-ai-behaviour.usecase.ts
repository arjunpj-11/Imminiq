import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { UpdateAIBehaviourPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateAIBehaviourRepository = {
  updateAIBehaviour: ISettingsCommandRepository['updateAIBehaviour'];
};

export interface IUpdateAIBehaviourUseCase {
  execute(
    userId: string,
    payload: UpdateAIBehaviourPayloadDTO
  ): Promise<UserSettingsViewDTO | null>;
}

export class UpdateAIBehaviourUseCase implements IUpdateAIBehaviourUseCase {
  constructor(
    private readonly _settingsRepository: UpdateAIBehaviourRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: UpdateAIBehaviourPayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateAIBehaviour({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
