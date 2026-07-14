import type {
  AdminSubscriptionOverview,
  AdminSubscriptionQuery,
  AdminPlanLimits,
  AdminSubscriptionPlan,
} from '../domain/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../domain/repositories/admin-subscriptions.repository.interface';
import type { AdminActor } from '../../shared';

export interface IAdminSubscriptionsUseCase {
  getOverview(query: AdminSubscriptionQuery): Promise<AdminSubscriptionOverview>;
  updatePlanLimits(
    planId: AdminSubscriptionPlan['planId'],
    limits: AdminPlanLimits,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlan>;
}

export class AdminSubscriptionsUseCase implements IAdminSubscriptionsUseCase {
  constructor(private readonly repository: IAdminSubscriptionsRepository) {}

  getOverview(query: AdminSubscriptionQuery) {
    return this.repository.getOverview(query);
  }

  updatePlanLimits(
    planId: AdminSubscriptionPlan['planId'],
    limits: AdminPlanLimits,
    actor: AdminActor
  ) {
    return this.repository.updatePlanLimits(planId, limits, actor);
  }
}
