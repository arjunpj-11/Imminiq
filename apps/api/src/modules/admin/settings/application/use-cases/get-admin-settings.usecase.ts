import type { AdminSettings } from '../../domain/entities/admin-settings.entity';
import type { IAdminSettingsRepository } from '../../domain/repositories/admin-settings.repository.interface';

export interface IGetAdminSettingsUseCase {
  execute(): Promise<AdminSettings>;
}

export class GetAdminSettingsUseCase implements IGetAdminSettingsUseCase {
  constructor(private readonly repository: IAdminSettingsRepository) {}

  execute(): Promise<AdminSettings> {
    return this.repository.get();
  }
}
