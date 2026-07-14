import type { AdminSettingsUseCases } from './application/admin-settings-use-cases.contract';
import { GetAdminSettingsUseCase } from './application/use-cases/get-admin-settings.usecase';
import { UpdateAdminSettingsUseCase } from './application/use-cases/update-admin-settings.usecase';
import { mongoAdminSettingsRepository } from './infrastructure/repositories/mongo-admin-settings.repository';
import { AdminSettingsMapper } from './application/admin-settings.mapper';
export type AdminSettingsComposition = { useCases: AdminSettingsUseCases };

export const createAdminSettingsComposition = (): AdminSettingsComposition => {
  const mapper = new AdminSettingsMapper();
  return {
    useCases: {
      get: new GetAdminSettingsUseCase(mongoAdminSettingsRepository, mapper),
      update: new UpdateAdminSettingsUseCase(mongoAdminSettingsRepository, mapper),
    },
  };
};
