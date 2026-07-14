import type { IGetAdminSubscriptionOverviewUseCase } from './use-cases/get-admin-subscription-overview.usecase';
import type { IUpdateAdminPlanUseCase } from './use-cases/update-admin-plan.usecase';

export type AdminSubscriptionsUseCases = {
  getOverview: IGetAdminSubscriptionOverviewUseCase;
  updatePlan: IUpdateAdminPlanUseCase;
};
