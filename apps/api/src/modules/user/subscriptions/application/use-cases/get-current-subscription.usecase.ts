import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { UserSubscriptionDTO } from '../subscriptions.dto';
import type { ISubscriptionsMapper } from '../subscriptions.mapper';
import type { IClock } from '../../../../../shared/time/clock.interface';

export interface IGetCurrentSubscriptionUseCase {
  execute(userId: string): Promise<UserSubscriptionDTO | null>;
}

export class GetCurrentSubscriptionUseCase implements IGetCurrentSubscriptionUseCase {
  constructor(
    private readonly _repository: Pick<ISubscriptionRepository, 'expireEnded' | 'findCurrent'>,
    private readonly _mapper: ISubscriptionsMapper,
    private readonly _clock: IClock
  ) {}

  async execute(userId: string) {
    await this._repository.expireEnded(userId, this._clock.now());
    const subscription = await this._repository.findCurrent(userId);
    return subscription ? this._mapper.toUserSubscriptionDTO(subscription) : null;
  }
}
