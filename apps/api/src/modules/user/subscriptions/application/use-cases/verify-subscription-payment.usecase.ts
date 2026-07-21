import type { PaymentVerificationInput } from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { ISubscriptionPaymentGateway } from '../../domain/services/subscription-payment-gateway.interface';
import { SubscriptionsApplicationError } from '../subscriptions-application.error';
import type { UserSubscriptionDTO } from '../subscriptions.dto';
import type { ISubscriptionsMapper } from '../subscriptions.mapper';
import type { IClock } from '../../../../../shared/time/clock.interface';

export interface IVerifySubscriptionPaymentUseCase {
  execute(input: PaymentVerificationInput): Promise<UserSubscriptionDTO>;
}

export class VerifySubscriptionPaymentUseCase implements IVerifySubscriptionPaymentUseCase {
  constructor(
    private readonly _repository: Pick<ISubscriptionRepository, 'activate' | 'findByOrderId'>,
    private readonly _paymentGateway: ISubscriptionPaymentGateway,
    private readonly _mapper: ISubscriptionsMapper,
    private readonly _clock: IClock
  ) {}

  async execute(input: PaymentVerificationInput) {
    const subscription = await this._repository.findByOrderId(input.razorpayOrderId);
    if (!subscription || subscription.userId !== input.userId) {
      throw SubscriptionsApplicationError.orderNotFound();
    }
    if (subscription.status === 'active') return this._mapper.toUserSubscriptionDTO(subscription);
    if (
      !this._paymentGateway.verifySignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      )
    ) {
      throw SubscriptionsApplicationError.invalidPaymentSignature();
    }
    const startsAt = this._clock.now();
    const endsAt = new Date(startsAt);
    if (subscription.billingCycle === 'annual') endsAt.setFullYear(endsAt.getFullYear() + 1);
    else endsAt.setMonth(endsAt.getMonth() + 1);
    const activated = await this._repository.activate(
      input.razorpayOrderId,
      input.razorpayPaymentId,
      input.razorpaySignature,
      startsAt,
      endsAt
    );
    return this._mapper.toUserSubscriptionDTO(activated);
  }
}
