import type { AdminActor } from '../../../../../shared/admin';
import type {
  AdminSubscriptionPlan,
  AdminPlanLimitField,
  AdminSubscriptionPlanInput,
} from '../../domain/entities/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../../domain/repositories/admin-subscriptions.repository.interface';
import type { AdminSubscriptionPlanDTO } from '../admin-subscriptions.dto';
import type { IAdminSubscriptionsMapper } from '../admin-subscriptions.mapper';

export interface IUpdateAdminPlanUseCase {
  execute(
    planId: AdminSubscriptionPlan['planId'],
    input: AdminSubscriptionPlanUpdateInput,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlanDTO>;
}

export type AdminSubscriptionPlanUpdateInput = {
  plan: AdminSubscriptionPlanInput;
  propagateLimitFields: AdminPlanLimitField[];
};

export class UpdateAdminPlanUseCase implements IUpdateAdminPlanUseCase {
  constructor(
    private readonly repository: IAdminSubscriptionsRepository,
    private readonly mapper: IAdminSubscriptionsMapper
  ) {}

  execute(
    planId: AdminSubscriptionPlan['planId'],
    input: AdminSubscriptionPlanUpdateInput,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlanDTO> {
    return this.repository
      .updatePlan(planId, input.plan, input.propagateLimitFields, actor)
      .then((plan) => this.mapper.toPlanDTO(plan));
  }
}
