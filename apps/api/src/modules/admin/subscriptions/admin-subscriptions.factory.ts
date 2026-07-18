import type { AdminSubscriptionsUseCases } from './application/admin-subscriptions-use-cases.contract';
import { GetAdminSubscriptionOverviewUseCase } from './application/use-cases/get-admin-subscription-overview.usecase';
import { UpdateAdminPlanUseCase } from './application/use-cases/update-admin-plan.usecase';
import { MongoAdminSubscriptionsRepository } from './infrastructure/repositories/mongo-admin-subscriptions.repository';
import { AdminSubscriptionsMapper } from './application/admin-subscriptions.mapper';
import type {
  AdminSubscriptionPlan,
  AdminSubscriptionPlanInput,
} from './domain/entities/admin-subscription.entity';

export type AdminSubscriptionsComposition = { useCases: AdminSubscriptionsUseCases };

export type AdminDefaultSubscriptionPlanResolver = (
  planId: AdminSubscriptionPlan['planId']
) => AdminSubscriptionPlanInput;

export const createAdminSubscriptionsComposition = (
  resolveDefaultPlan: AdminDefaultSubscriptionPlanResolver
): AdminSubscriptionsComposition => {
  const mapper = new AdminSubscriptionsMapper();
  const repository = new MongoAdminSubscriptionsRepository(resolveDefaultPlan);
  return {
    useCases: {
      getOverview: new GetAdminSubscriptionOverviewUseCase(
        repository,
        mapper
      ),
      updatePlan: new UpdateAdminPlanUseCase(repository, mapper),
    },
  };
};
