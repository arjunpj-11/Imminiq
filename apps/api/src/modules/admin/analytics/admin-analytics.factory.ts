import { GetAdminAnalyticsUseCase } from './application/use-cases/get-admin-analytics.usecase'
import { mongoAdminAnalyticsRepository } from './infrastructure/repositories/mongo-admin-analytics.repository'
export const createAdminAnalyticsComposition = () => ({ useCase: new GetAdminAnalyticsUseCase(mongoAdminAnalyticsRepository) })
