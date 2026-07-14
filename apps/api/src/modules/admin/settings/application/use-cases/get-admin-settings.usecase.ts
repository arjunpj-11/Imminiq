import type { IAdminSettingsRepository } from '../../domain/repositories/admin-settings.repository.interface';
import type { AdminSettingsDTO } from '../admin-settings.dto';
import type { IAdminSettingsMapper } from '../admin-settings.mapper';

export interface IGetAdminSettingsUseCase {
  execute(): Promise<AdminSettingsDTO>;
}

export class GetAdminSettingsUseCase implements IGetAdminSettingsUseCase {
  constructor(
    private readonly repository: IAdminSettingsRepository,
    private readonly mapper: IAdminSettingsMapper
  ) {}

  async execute(): Promise<AdminSettingsDTO> {
    return this.mapper.toDTO(await this.repository.get());
  }
}
