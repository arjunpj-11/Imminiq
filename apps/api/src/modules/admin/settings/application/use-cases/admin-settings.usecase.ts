import type { AdminActor } from '../../../shared';
import type { AdminSettings, AdminSettingsInput } from '../../domain/admin-settings.entity';
import type { IAdminSettingsRepository } from '../../domain/repositories/admin-settings.repository.interface';
export interface IAdminSettingsUseCase {
  get(): Promise<AdminSettings>;
  update(input: AdminSettingsInput, actor: AdminActor): Promise<AdminSettings>;
}
export class AdminSettingsUseCase implements IAdminSettingsUseCase {
  constructor(private readonly repository: IAdminSettingsRepository) {}
  get() {
    return this.repository.get();
  }
  update(input: AdminSettingsInput, actor: AdminActor) {
    return this.repository.update(input, actor);
  }
}
