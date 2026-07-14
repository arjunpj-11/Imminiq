import { SUBSCRIPTION_PLANS } from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { SubscriptionPlanDTO } from '../subscriptions.dto';
import type { ISubscriptionsMapper } from '../subscriptions.mapper';

export interface IListSubscriptionPlansUseCase {
  execute(): Promise<SubscriptionPlanDTO[]>;
}

export class ListSubscriptionPlansUseCase implements IListSubscriptionPlansUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly mapper: ISubscriptionsMapper
  ) {}

  execute() {
    return Promise.all(
      SUBSCRIPTION_PLANS.map(async (plan) =>
        this.mapper.toPlanDTO({
          ...plan,
          limits: await this.repository.getPlanLimits(plan.id),
        })
      )
    );
  }
}
