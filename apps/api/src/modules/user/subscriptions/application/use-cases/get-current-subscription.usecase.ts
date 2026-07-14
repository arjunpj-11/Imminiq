import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { UserSubscriptionDTO } from '../subscriptions.dto';
import type { ISubscriptionsMapper } from '../subscriptions.mapper';
import type { IClock } from '../../../../../shared/time/clock.interface';

export interface IGetCurrentSubscriptionUseCase {
  execute(userId: string): Promise<UserSubscriptionDTO | null>;
}

export class GetCurrentSubscriptionUseCase implements IGetCurrentSubscriptionUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly mapper: ISubscriptionsMapper,
    private readonly clock: IClock
  ) {}

  async execute(userId: string) {
    await this.repository.expireEnded(userId, this.clock.now());
    const subscription = await this.repository.findCurrent(userId);
    return subscription ? this.mapper.toUserSubscriptionDTO(subscription) : null;
  }
}
