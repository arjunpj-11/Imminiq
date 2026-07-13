import type { AdminDashboardUseCases } from './application/admin-dashboard-use-cases.contract'
import { AdminDashboardMapper } from './application/admin-dashboard.mapper'
import { GetAdminDashboardUseCase } from './application/use-cases/get-admin-dashboard.usecase'
import { mongoAdminDashboardRepository } from './infrastructure/repositories/mongo-admin-dashboard.repository'

export type AdminDashboardComposition = { useCases: AdminDashboardUseCases }

export const createAdminDashboardComposition = (): AdminDashboardComposition => {
  const mapper = new AdminDashboardMapper()
  return { useCases: { getOverview: new GetAdminDashboardUseCase(mongoAdminDashboardRepository, mapper) } }
}
