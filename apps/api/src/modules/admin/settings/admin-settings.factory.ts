import type { AdminSettingsUseCases } from './application/admin-settings-use-cases.contract';
import { GetAdminSettingsUseCase } from './application/use-cases/get-admin-settings.usecase';
import { UpdateAdminSettingsUseCase } from './application/use-cases/update-admin-settings.usecase';
import { mongoAdminSettingsRepository } from './infrastructure/repositories/mongo-admin-settings.repository';
export type AdminSettingsComposition = { useCases: AdminSettingsUseCases };

export const createAdminSettingsComposition = (): AdminSettingsComposition => ({
  useCases: {
    get: new GetAdminSettingsUseCase(mongoAdminSettingsRepository),
    update: new UpdateAdminSettingsUseCase(mongoAdminSettingsRepository),
  },
});
