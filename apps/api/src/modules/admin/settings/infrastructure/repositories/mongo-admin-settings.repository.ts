import { AdminConsoleSettings } from '../../../../../infrastructure/database/models/admin-console-settings.model';
import type { AdminActor } from '../../../../../shared/admin';
import { recordAdminAction } from '../../../../../infrastructure/admin';
import type { AdminSettingsInput } from '../../domain/entities/admin-settings.entity';
import type { IAdminSettingsRepository } from '../../domain/repositories/admin-settings.repository.interface';
import { resolvePlatformPolicy, type PlatformPolicy } from '../../../../../shared/platform-policy';
const view = {
  _id: 0,
  allowBroadcasts: 1,
  aiMonthlyTokenBudget: 1,
  aiBudgetWarningPercent: 1,
  productPolicy: 1,
  updatedAt: 1,
};

const normalizeSettings = <T extends { productPolicy?: Partial<PlatformPolicy> }>(settings: T) => ({
  ...settings,
  productPolicy: resolvePlatformPolicy(settings.productPolicy),
});
export class MongoAdminSettingsRepository implements IAdminSettingsRepository {
  async get() {
    const settings = await AdminConsoleSettings.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global' } },
      { upsert: true, returnDocument: 'after' }
    )
      .select(view)
      .lean();
    return normalizeSettings(settings ?? {}) as Awaited<
      ReturnType<IAdminSettingsRepository['get']>
    >;
  }
  async update(input: AdminSettingsInput, actor: AdminActor) {
    const settings = await AdminConsoleSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: { ...input, updatedBy: actor.userId } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )
      .select(view)
      .lean();
    await recordAdminAction(actor, 'admin_console_settings_updated', 'admin.settings', input);
    return normalizeSettings(settings ?? {}) as Awaited<
      ReturnType<IAdminSettingsRepository['update']>
    >;
  }
}
export const mongoAdminSettingsRepository = new MongoAdminSettingsRepository();
