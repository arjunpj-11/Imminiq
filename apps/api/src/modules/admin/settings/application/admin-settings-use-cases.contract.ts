import type { IGetAdminSettingsUseCase } from './use-cases/get-admin-settings.usecase';
import type { IUpdateAdminSettingsUseCase } from './use-cases/update-admin-settings.usecase';

export type AdminSettingsUseCases = {
  get: IGetAdminSettingsUseCase;
  update: IUpdateAdminSettingsUseCase;
};
