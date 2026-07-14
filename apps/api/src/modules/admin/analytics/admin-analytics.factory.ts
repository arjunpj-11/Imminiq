import type { AdminAnalyticsUseCases } from './application/admin-analytics-use-cases.contract';
import { GetAdminAnalyticsUseCase } from './application/use-cases/get-admin-analytics.usecase';
import { mongoAdminAnalyticsRepository } from './infrastructure/repositories/mongo-admin-analytics.repository';
import { AdminAnalyticsMapper } from './application/admin-analytics.mapper';
export type AdminAnalyticsComposition = { useCases: AdminAnalyticsUseCases };

export const createAdminAnalyticsComposition = (): AdminAnalyticsComposition => {
  const mapper = new AdminAnalyticsMapper();
  return {
    useCases: { get: new GetAdminAnalyticsUseCase(mongoAdminAnalyticsRepository, mapper) },
  };
};
