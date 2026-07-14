import type { UserSubscription } from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';

export interface IGetCurrentSubscriptionUseCase {
  execute(userId: string): Promise<UserSubscription | null>;
}

export class GetCurrentSubscriptionUseCase implements IGetCurrentSubscriptionUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(userId: string) {
    await this.repository.expireEnded(userId, new Date());
    return this.repository.findCurrent(userId);
  }
}
