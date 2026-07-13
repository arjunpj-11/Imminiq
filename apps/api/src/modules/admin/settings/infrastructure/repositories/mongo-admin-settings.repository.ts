import { AdminConsoleSettings } from '../../../../../infrastructure/database/models/admin-console-settings.model'
import type { AdminActor } from '../../../shared'
import { recordAdminAction } from '../../../shared'
import type { AdminSettingsInput } from '../../domain/admin-settings.entity'
import type { IAdminSettingsRepository } from '../../domain/repositories/admin-settings.repository.interface'
const view = { _id: 0, maintenanceMode: 1, allowBroadcasts: 1, supportEmail: 1, auditRetentionDays: 1, updatedAt: 1 }
export class MongoAdminSettingsRepository implements IAdminSettingsRepository {
  async get() { const settings = await AdminConsoleSettings.findOneAndUpdate({ key: 'global' }, { $setOnInsert: { key: 'global' } }, { upsert: true, new: true }).select(view).lean(); return settings as unknown as Awaited<ReturnType<IAdminSettingsRepository['get']>> }
  async update(input: AdminSettingsInput, actor: AdminActor) { const settings = await AdminConsoleSettings.findOneAndUpdate({ key: 'global' }, { $set: { ...input, updatedBy: actor.userId } }, { upsert: true, new: true, setDefaultsOnInsert: true }).select(view).lean(); await recordAdminAction(actor, 'admin_console_settings_updated', 'admin.settings', input); return settings as unknown as Awaited<ReturnType<IAdminSettingsRepository['update']>> }
}
export const mongoAdminSettingsRepository = new MongoAdminSettingsRepository()
