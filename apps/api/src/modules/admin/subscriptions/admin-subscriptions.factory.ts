import type { AdminSubscriptionsUseCases } from './application/admin-subscriptions-use-cases.contract';
import { GetAdminSubscriptionOverviewUseCase } from './application/use-cases/get-admin-subscription-overview.usecase';
import { UpdateAdminPlanUseCase } from './application/use-cases/update-admin-plan.usecase';
import { mongoAdminSubscriptionsRepository } from './infrastructure/repositories/mongo-admin-subscriptions.repository';
import { AdminSubscriptionsMapper } from './application/admin-subscriptions.mapper';

export type AdminSubscriptionsComposition = { useCases: AdminSubscriptionsUseCases };

export const createAdminSubscriptionsComposition = (): AdminSubscriptionsComposition => {
  const mapper = new AdminSubscriptionsMapper();
  return {
    useCases: {
      getOverview: new GetAdminSubscriptionOverviewUseCase(
        mongoAdminSubscriptionsRepository,
        mapper
      ),
      updatePlan: new UpdateAdminPlanUseCase(
        mongoAdminSubscriptionsRepository,
        mapper
      ),
    },
  };
};
