import crypto from 'node:crypto';
import { env } from '../../../../config/env';
import { razorpay } from '../../../../infrastructure/payment/razorpay.client';
import type { ISubscriptionPaymentGateway } from '../domain/services/subscription-payment-gateway.interface';

export class RazorpaySubscriptionPaymentGateway implements ISubscriptionPaymentGateway {
  async createOrder(amount: number, receipt: string) {
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt });
    return { id: order.id, amount: Number(order.amount), currency: order.currency };
  }

  verifySignature(orderId: string, paymentId: string, signature: string) {
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    return (
      actualBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    );
  }

  getPublicKey() {
    return env.RAZORPAY_KEY_ID;
  }
}

export const razorpaySubscriptionPaymentGateway = new RazorpaySubscriptionPaymentGateway();
