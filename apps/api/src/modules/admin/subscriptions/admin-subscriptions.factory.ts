import type { AdminSubscriptionsUseCases } from './application/admin-subscriptions-use-cases.contract';
import { GetAdminSubscriptionOverviewUseCase } from './application/use-cases/get-admin-subscription-overview.usecase';
import { UpdateAdminPlanLimitsUseCase } from './application/use-cases/update-admin-plan-limits.usecase';
import { mongoAdminSubscriptionsRepository } from './infrastructure/repositories/mongo-admin-subscriptions.repository';

export type AdminSubscriptionsComposition = { useCases: AdminSubscriptionsUseCases };

export const createAdminSubscriptionsComposition = (): AdminSubscriptionsComposition => ({
  useCases: {
    getOverview: new GetAdminSubscriptionOverviewUseCase(mongoAdminSubscriptionsRepository),
    updatePlanLimits: new UpdateAdminPlanLimitsUseCase(mongoAdminSubscriptionsRepository),
  },
});
