import type { AdminActor } from '../../../shared/domain';
import type { AdminSettings, AdminSettingsInput } from '../entities/admin-settings.entity';
export interface IAdminSettingsRepository {
  get(): Promise<AdminSettings>;
  update(input: AdminSettingsInput, actor: AdminActor): Promise<AdminSettings>;
}
