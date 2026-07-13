import { AdminSettingsUseCase } from './application/use-cases/admin-settings.usecase'
import { mongoAdminSettingsRepository } from './infrastructure/repositories/mongo-admin-settings.repository'
export const createAdminSettingsComposition = () => ({ useCase: new AdminSettingsUseCase(mongoAdminSettingsRepository) })
