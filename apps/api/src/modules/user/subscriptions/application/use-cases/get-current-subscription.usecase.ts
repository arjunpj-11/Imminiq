import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { UserSubscriptionDTO } from '../subscriptions.dto';
import type { ISubscriptionsMapper } from '../subscriptions.mapper';

export interface IGetCurrentSubscriptionUseCase {
  execute(userId: string): Promise<UserSubscriptionDTO | null>;
}

export class GetCurrentSubscriptionUseCase implements IGetCurrentSubscriptionUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly mapper: ISubscriptionsMapper
  ) {}

  async execute(userId: string) {
    await this.repository.expireEnded(userId, new Date());
    const subscription = await this.repository.findCurrent(userId);
    return subscription ? this.mapper.toUserSubscriptionDTO(subscription) : null;
  }
}
