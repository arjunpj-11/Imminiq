import type { AdminActor } from '../../../../../shared/admin';
import type { AdminSettingsInput } from '../../domain/entities/admin-settings.entity';
import type { IAdminSettingsRepository } from '../../domain/repositories/admin-settings.repository.interface';
import type { AdminSettingsDTO } from '../admin-settings.dto';
import type { IAdminSettingsMapper } from '../admin-settings.mapper';

export interface IUpdateAdminSettingsUseCase {
  execute(input: AdminSettingsInput, actor: AdminActor): Promise<AdminSettingsDTO>;
}

export class UpdateAdminSettingsUseCase implements IUpdateAdminSettingsUseCase {
  constructor(
    private readonly _repository: IAdminSettingsRepository,
    private readonly _mapper: IAdminSettingsMapper
  ) {}

  async execute(input: AdminSettingsInput, actor: AdminActor): Promise<AdminSettingsDTO> {
    return this._mapper.toDTO(await this._repository.update(input, actor));
  }
}
