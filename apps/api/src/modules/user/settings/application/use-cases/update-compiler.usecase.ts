import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { IUpdateCompilerPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateCompilerRepository = {
  updateCompiler: ISettingsCommandRepository['updateCompiler'];
};

export interface IUpdateCompilerUseCase {
  execute(userId: string, payload: IUpdateCompilerPayloadDTO): Promise<UserSettingsViewDTO | null>;
}

export class UpdateCompilerUseCase implements IUpdateCompilerUseCase {
  constructor(
    private readonly _settingsRepository: UpdateCompilerRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: IUpdateCompilerPayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateCompiler({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
