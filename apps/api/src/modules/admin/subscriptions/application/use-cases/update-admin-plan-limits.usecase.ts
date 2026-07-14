import type { AdminActor } from '../../../shared';
import type {
  AdminPlanLimits,
  AdminSubscriptionPlan,
} from '../../domain/entities/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../../domain/repositories/admin-subscriptions.repository.interface';

export interface IUpdateAdminPlanLimitsUseCase {
  execute(
    planId: AdminSubscriptionPlan['planId'],
    limits: AdminPlanLimits,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlan>;
}

export class UpdateAdminPlanLimitsUseCase implements IUpdateAdminPlanLimitsUseCase {
  constructor(private readonly repository: IAdminSubscriptionsRepository) {}

  execute(
    planId: AdminSubscriptionPlan['planId'],
    limits: AdminPlanLimits,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlan> {
    return this.repository.updatePlanLimits(planId, limits, actor);
  }
}
