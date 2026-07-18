import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { SubscriptionPlanDTO } from '../subscriptions.dto';
import type { ISubscriptionsMapper } from '../subscriptions.mapper';

export interface IListSubscriptionPlansUseCase {
  execute(): Promise<SubscriptionPlanDTO[]>;
}

export class ListSubscriptionPlansUseCase implements IListSubscriptionPlansUseCase {
  constructor(
    private readonly repository: Pick<ISubscriptionRepository, 'getPlans'>,
    private readonly mapper: ISubscriptionsMapper
  ) {}

  async execute() {
    return (await this.repository.getPlans()).map((plan) => this.mapper.toPlanDTO(plan));
  }
}
