import type { AdminActor } from '../../../../../shared/admin';
import type { AdminSubscriptionPlan } from '../../domain/entities/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../../domain/repositories/admin-subscriptions.repository.interface';
import type {
  AdminSubscriptionPlanDTO,
  AdminSubscriptionPlanUpdateInputDTO,
} from '../admin-subscriptions.dto';
import type { IAdminSubscriptionsMapper } from '../admin-subscriptions.mapper';

export interface IUpdateAdminPlanUseCase {
  execute(
    planId: AdminSubscriptionPlan['planId'],
    input: AdminSubscriptionPlanUpdateInputDTO,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlanDTO>;
}

export class UpdateAdminPlanUseCase implements IUpdateAdminPlanUseCase {
  constructor(
    private readonly _repository: Pick<IAdminSubscriptionsRepository, 'updatePlan'>,
    private readonly _mapper: IAdminSubscriptionsMapper
  ) {}

  execute(
    planId: AdminSubscriptionPlan['planId'],
    input: AdminSubscriptionPlanUpdateInputDTO,
    actor: AdminActor
  ): Promise<AdminSubscriptionPlanDTO> {
    return this._repository
      .updatePlan(planId, input.plan, input.propagateLimitFields, actor)
      .then((plan) => this._mapper.toPlanDTO(plan));
  }
}
