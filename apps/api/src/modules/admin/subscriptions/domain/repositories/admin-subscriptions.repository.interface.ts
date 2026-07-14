import type {
  AdminSubscriptionOverview,
  AdminSubscriptionQuery,
  AdminPlanLimits,
  AdminSubscriptionPlan,
} from '../entities/admin-subscription.entity';
import type { AdminActor } from '../../../shared/domain';

export interface IAdminSubscriptionsRepository {
  getOverview(query: AdminSubscriptionQuery): Promise<AdminSubscriptionOverview>;
  updatePlanLimits(
    planId: AdminSubscriptionPlan['planId'],
    limits: AdminPlanLimits,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlan>;
}
