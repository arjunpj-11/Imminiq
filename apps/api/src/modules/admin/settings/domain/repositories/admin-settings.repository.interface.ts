import type { AdminActor } from '../../../shared'
import type { AdminSettings, AdminSettingsInput } from '../admin-settings.entity'
export interface IAdminSettingsRepository { get(): Promise<AdminSettings>; update(input: AdminSettingsInput, actor: AdminActor): Promise<AdminSettings> }
