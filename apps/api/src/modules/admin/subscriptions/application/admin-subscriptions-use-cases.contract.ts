import type { IGetAdminSubscriptionOverviewUseCase } from './use-cases/get-admin-subscription-overview.usecase';
import type { IUpdateAdminPlanLimitsUseCase } from './use-cases/update-admin-plan-limits.usecase';

export type AdminSubscriptionsUseCases = {
  getOverview: IGetAdminSubscriptionOverviewUseCase;
  updatePlanLimits: IUpdateAdminPlanLimitsUseCase;
};
