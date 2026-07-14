import type { AdminActor } from '../../../shared';
import type {
  AdminSettings,
  AdminSettingsInput,
} from '../../domain/entities/admin-settings.entity';
import type { IAdminSettingsRepository } from '../../domain/repositories/admin-settings.repository.interface';

export interface IUpdateAdminSettingsUseCase {
  execute(input: AdminSettingsInput, actor: AdminActor): Promise<AdminSettings>;
}

export class UpdateAdminSettingsUseCase implements IUpdateAdminSettingsUseCase {
  constructor(private readonly repository: IAdminSettingsRepository) {}

  execute(input: AdminSettingsInput, actor: AdminActor): Promise<AdminSettings> {
    return this.repository.update(input, actor);
  }
}
