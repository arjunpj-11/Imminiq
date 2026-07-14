import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';

export interface IListSubscriptionPlansUseCase {
  execute(): Promise<SubscriptionPlan[]>;
}

export class ListSubscriptionPlansUseCase implements IListSubscriptionPlansUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  execute() {
    return Promise.all(
      SUBSCRIPTION_PLANS.map(async (plan) => ({
        ...plan,
        features: [...plan.features],
        limits: await this.repository.getPlanLimits(plan.id),
      }))
    );
  }
}
