import type { AdminActor } from '../../../shared';
import type {
  AdminPlanLimits,
  AdminSubscriptionPlan,
} from '../../domain/entities/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../../domain/repositories/admin-subscriptions.repository.interface';
import type { IAdminSubscriptionPlanDTO } from '../admin-subscriptions.dto';
import type { IAdminSubscriptionsMapper } from '../admin-subscriptions.mapper';

export interface IUpdateAdminPlanLimitsUseCase {
  execute(
    planId: AdminSubscriptionPlan['planId'],
    limits: AdminPlanLimits,
    actor: AdminActor
  ): Promise<IAdminSubscriptionPlanDTO>;
}

export class UpdateAdminPlanLimitsUseCase implements IUpdateAdminPlanLimitsUseCase {
  constructor(
    private readonly repository: IAdminSubscriptionsRepository,
    private readonly mapper: IAdminSubscriptionsMapper
  ) {}

  execute(
    planId: AdminSubscriptionPlan['planId'],
    limits: AdminPlanLimits,
    actor: AdminActor
  ): Promise<IAdminSubscriptionPlanDTO> {
    return this.repository
      .updatePlanLimits(planId, limits, actor)
      .then((plan) => this.mapper.toPlanDTO(plan));
  }
}
