import type {
  AdminSubscriptionOverview,
  AdminSubscriptionQuery,
  AdminSubscriptionPlan,
  AdminSubscriptionPlanInput,
} from '../entities/admin-subscription.entity';
import type { AdminActor } from '../../../shared/domain';

export interface IAdminSubscriptionsRepository {
  getOverview(query: AdminSubscriptionQuery): Promise<AdminSubscriptionOverview>;
  updatePlan(
    planId: AdminSubscriptionPlan['planId'],
    input: AdminSubscriptionPlanInput,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlan>;
}
